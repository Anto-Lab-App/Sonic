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
        if (locale === 'es') currency = 'eur';

        let name = '';
        let description = '';
        let unit_amount = 0;

        if (packageType === 'unlock_1') {
            name = 'Odblokuj Raport';
            description = 'Pełny dostęp do jednego szczegółowego raportu diagnostycznego.';
            if (currency === 'pln') unit_amount = 1999;
            else if (currency === 'usd') unit_amount = 499;
            else unit_amount = 499;
        } else {
            // bundle_3
            name = 'Pakiet 3 Raportów';
            description = 'Nielimitowany dostęp do 3 pełnych diagnoz.';
            if (currency === 'pln') unit_amount = 3999;
            else if (currency === 'usd') unit_amount = 999;
            else unit_amount = 999;
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
            success_url: `${appUrl}/?success=true`,
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
