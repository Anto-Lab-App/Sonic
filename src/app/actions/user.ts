"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getUserProfile() {
    try {
        const { userId } = await auth();
        if (!userId) return null;

        const clerkUser = await currentUser();
        if (!clerkUser) return null;

        let user = await prisma.user.findUnique({
            where: { clerkUserId: userId },
        });

        const email = clerkUser.emailAddresses[0]?.emailAddress || "Brak emaila";
        const firstName = clerkUser.firstName || "";
        const lastName = clerkUser.lastName || "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ") || email.split('@')[0];

        const initials = [firstName, lastName]
            .filter(Boolean)
            .map(n => n[0])
            .join("")
            .toUpperCase() || email[0].toUpperCase();

        if (!user) {
            user = await prisma.user.create({
                data: {
                    clerkUserId: userId,
                    email: email,
                    credits: 1,
                }
            });
        }

        return {
            id: user.id,
            email: user.email,
            credits: user.credits,
            fullName,
            initials
        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}
