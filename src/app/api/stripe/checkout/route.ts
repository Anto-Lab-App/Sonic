import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { packageType, locale = 'pl', diagnosisId } = body;

        let currency = 'pln';
        if (locale === 'en') currency = 'usd';
        else if (locale === 'es' || locale === 'de') currency = 'eur';

        let name = '';
        let description = '';
        let unit_amount = 0;

        if (packageType === 'unlock_1') {
            if (locale === 'en') {
                name = 'Unlock Report';
                description = 'Full access to one detailed diagnostic report.';
            } else if (locale === 'es') {
                name = 'Desbloquear Informe';
                description = 'Acceso completo a un informe diagnóstico detallado.';
            } else if (locale === 'de') {
                name = 'Bericht entsperren';
                description = 'Vollständiger Zugriff auf einen detaillierten Diagnosebericht.';
            } else {
                name = 'Odblokuj Raport';
                description = 'Pełny dostęp do jednego szczegółowego raportu diagnostycznego.';
            }
            if (currency === 'pln') unit_amount = 1999;
            else if (currency === 'usd') unit_amount = 499;
            else unit_amount = 499; // EUR
        } else {
            // bundle_3
            if (locale === 'en') {
                name = '3 Reports Bundle';
                description = 'Unlimited access to 3 full diagnoses.';
            } else if (locale === 'es') {
                name = 'Paquete de 3 Informes';
                description = 'Acceso ilimitado a 3 diagnósticos completos.';
            } else if (locale === 'de') {
                name = '3 Berichte Paket';
                description = 'Unbegrenzter Zugang zu 3 vollständigen Diagnosen.';
            } else {
                name = 'Pakiet 3 Raportów';
                description = 'Nielimitowany dostęp do 3 pełnych diagnoz.';
            }
            if (currency === 'pln') unit_amount = 3999;
            else if (currency === 'usd') unit_amount = 999;
            else unit_amount = 999; // EUR
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const payment_method_types: any[] =
            currency === 'pln' ? ['card', 'blik', 'p24'] : ['card'];

        const session = await stripe.checkout.sessions.create({
            payment_method_types,
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name,
                            description,
                        },
                        unit_amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: diagnosisId ? `${appUrl}/?success=true&diagnosisId=${diagnosisId}` : `${appUrl}/?success=true`,
            cancel_url: `${appUrl}/?canceled=true`,
            metadata: {
                userId,
                packageType,
                diagnosisId: diagnosisId || '',
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('[Stripe Checkout Error]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
