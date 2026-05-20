// Web Bluetooth OBD-II Logic

// Web Bluetooth typings
declare global {
    interface Navigator {
        bluetooth: {
            requestDevice(options: any): Promise<any>;
        };
    }
}

type BluetoothDevice = any;
type BluetoothRemoteGATTServer = any;
type BluetoothRemoteGATTCharacteristic = any;
type BluetoothRemoteGATTService = any;

// Common BLE Service UUIDs for generic OBD-II dongles
const BLE_SERVICES = [
    '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10 / CC2541 generic
    '0000fff0-0000-1000-8000-00805f9b34fb', // Vgate and some others
    '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART
];

export class OBDManager {
    private device: BluetoothDevice | null = null;
    private server: BluetoothRemoteGATTServer | null = null;
    private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private buffer: string = '';
    private onDataReceived: ((data: string) => void) | null = null;
    private _isConnected: boolean = false;

    public onDisconnect: (() => void) | null = null;

    async connect() {
        if (!navigator.bluetooth || !navigator.bluetooth.requestDevice) {
            throw new Error("Web Bluetooth API is not supported in this browser. Try Chrome on Android or Desktop.");
        }

        try {
            this.device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [
                    '0000ffe0-0000-1000-8000-00805f9b34fb',
                    '0000fff0-0000-1000-8000-00805f9b34fb',
                    '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
                    '0000e000-0000-1000-8000-00805f9b34fb', // Additional Vgate service
                ],
            });

            this.device.addEventListener('gattserverdisconnected', this.handleDisconnect.bind(this));

            if (!this.device.gatt) throw new Error("GATT is not supported on this device.");

            this.server = await this.device.gatt.connect();

            // Find the correct service and characteristic
            const services = await this.server.getPrimaryServices();
            if (services.length === 0) throw new Error("No services found on device.");

            let targetService: BluetoothRemoteGATTService | null = null;
            for (const service of services) {
                if (BLE_SERVICES.includes(service.uuid) || service.uuid.includes('ffe0') || service.uuid.includes('fff0') || service.uuid.includes('6e400001')) {
                    targetService = service;
                    break;
                }
            }

            if (!targetService) {
                targetService = services[0]; // fallback to first available
            }

            const characteristics = await targetService.getCharacteristics();
            // Look for characteristic that supports both write and notify
            for (const char of characteristics) {
                if ((char.properties.write || char.properties.writeWithoutResponse) &&
                    (char.properties.notify || char.properties.indicate)) {
                    this.characteristic = char;
                    break;
                }
            }

            if (!this.characteristic) {
                // Fallback: take first characteristic, hoping it works
                this.characteristic = characteristics[0];
            }

            await this.characteristic.startNotifications();
            this.characteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged.bind(this));

            this._isConnected = true;

            // Initialization sequence
            await this.sendCommand('ATZ'); // Reset
            await new Promise(r => setTimeout(r, 1000));
            await this.sendCommand('ATE0'); // Echo off
            await this.sendCommand('ATL0'); // Line feeds off
            await this.sendCommand('ATSP0'); // Automatic protocol selection
            await new Promise(r => setTimeout(r, 1000));

            return true;
        } catch (err) {
            console.error("OBD Connection Error:", err);
            this.disconnect();
            throw err;
        }
    }

    private handleDisconnect() {
        this._isConnected = false;
        this.device = null;
        this.server = null;
        this.characteristic = null;
        if (this.onDisconnect) this.onDisconnect();
    }

    public disconnect() {
        if (this.device && this.device.gatt && this.device.gatt.connected) {
            this.device.gatt.disconnect();
        }
        this.handleDisconnect();
    }

    public get isConnected() {
        return this._isConnected;
    }

    private handleCharacteristicValueChanged(event: Event) {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;

        const decoder = new TextDecoder('utf-8');
        const chunk = decoder.decode(value);
        this.buffer += chunk;

        // ELM327 uses '>' as prompt meaning it finished replying
        if (this.buffer.includes('>')) {
            if (this.onDataReceived) {
                this.onDataReceived(this.buffer.trim());
            }
            this.buffer = ''; // clear buffer
        }
    }

    public async sendCommand(cmd: string, timeoutMs: number = 5000): Promise<string> {
        if (!this.characteristic) throw new Error("Not connected");

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.onDataReceived = null;
                reject(new Error(`Command ${cmd} timed out`));
            }, timeoutMs);

            this.onDataReceived = (data) => {
                clearTimeout(timeout);
                this.onDataReceived = null;
                // Clean response: remove the command echo if present, empty lines, and the prompt
                let lines = data.split(/[\r\n]+/).filter(l => l.trim() !== '');
                // Sometimes the first line is the command itself if Echo is not properly off
                if (lines.length > 0 && lines[0].includes(cmd)) {
                    lines.shift();
                }
                let cleanResponse = lines.join('\n').replace(/>/g, '').trim();
                resolve(cleanResponse);
            };

            const encoder = new TextEncoder();
            this.characteristic!.writeValue(encoder.encode(cmd + '\r')).catch(err => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    }

    // Parses response for OBD codes (Mode 3)
    public async getDTCs(): Promise<string[]> {
        try {
            const res = await this.sendCommand('03');
            // A standard response might look like: "43 01 33 00 00 00 00" or similar hex
            // If no codes, usually "43 00 ..." or "NO DATA"
            if (res.includes("NO DATA") || res.includes("OK")) return [];

            const codes: string[] = [];
            const lines = res.split('\n');

            for (let line of lines) {
                let hexStr = line.replace(/\s/g, '');
                // "43" is the response to "03"
                if (hexStr.startsWith('43')) {
                    hexStr = hexStr.substring(2);
                    for (let i = 0; i < hexStr.length; i += 4) {
                        const chunk = hexStr.substring(i, i + 4);
                        if (chunk.length === 4 && chunk !== '0000') {
                            const code = this.decodeDTC(chunk);
                            if (code && !codes.includes(code)) {
                                codes.push(code);
                            }
                        }
                    }
                }
            }
            return codes;
        } catch (e) {
            console.warn("Failed to get DTCs:", e);
            return [];
        }
    }

    // Decode standard 2-byte HEX DTC into string (e.g., P0420)
    private decodeDTC(hex: string): string {
        const firstHex = parseInt(hex[0], 16);
        const systemMap = ['P', 'C', 'B', 'U'];
        const type = systemMap[(firstHex >> 2) & 0x3];
        const secondChar = (firstHex & 0x3).toString();
        return `${type}${secondChar}${hex.substring(1)}`;
    }
}

export const obdManager = new OBDManager();
