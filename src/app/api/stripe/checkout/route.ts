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

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'p24'],
            line_items: [
                {
                    price_data: {
                        currency: 'pln',
                        product_data: {
                            name: 'Pakiet 3 Skanów PRO',
                            description: 'Zdobądź nielimitowany dostęp do zaawansowanej AI Sonic dla 3 pełnych skanów (wideo/audio/shazam).',
                        },
                        unit_amount: 2900, // 29.00 PLN (Stripe używa groszy)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${appUrl}/?success=true`,
            cancel_url: `${appUrl}/?canceled=true`,
            metadata: {
                userId: userId,
                credits: 3,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('[Stripe Checkout Error]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
