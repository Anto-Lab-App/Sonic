import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    console.error('[Stripe Webhook Error]', error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    const userId = session.metadata?.userId;
    const packageType = session.metadata?.packageType; // 'unlock_1' or 'bundle_3'
    const diagnosisId = session.metadata?.diagnosisId;

    if (userId) {
      try {
        let creditsToAdd = packageType === 'bundle_3' ? 3 : 1;

        if (diagnosisId) {
          // Unlocking a specific report
          await prisma.diagnosis.update({
            where: { id: diagnosisId },
            data: { isUnlocked: true } as any
          });
          console.log(`[Stripe Webhook] Successfully unlocked report ${diagnosisId}`);
          creditsToAdd -= 1; // 1 credit was consumed to unlock this specific report
        }

        if (creditsToAdd > 0) {
          const user = await prisma.user.update({
            where: { clerkUserId: userId },
            data: {
              credits: {
                increment: creditsToAdd
              }
            }
          });
          console.log(`[Stripe Webhook] Successfully added ${creditsToAdd} credits to user ${userId}. New balance: ${user.credits}`);
        }
      } catch (dbError) {
        console.error('[Stripe Webhook DB Error]', dbError);
        return new NextResponse('Database Error', { status: 500 });
      }
    } else {
      console.warn('[Stripe Webhook] Missing userId in session metadata', session.metadata);
    }
  }

  return new NextResponse('OK', { status: 200 });
}
