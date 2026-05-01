"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getUserDiagnoses() {
    try {
        const { userId } = await auth();
        console.log("[getUserDiagnoses] clerk userId:", userId);
        if (!userId) return [];

        let user = await prisma.user.findUnique({
            where: { clerkUserId: userId },
        });

        console.log("[getUserDiagnoses] found user record:", user);

        if (!user) {
            console.log("[getUserDiagnoses] User record missing, attempting to create...");
            const clerkUser = await currentUser();
            if (clerkUser) {
                user = await prisma.user.create({
                    data: {
                        clerkUserId: userId,
                        email: clerkUser.emailAddresses[0].emailAddress,
                        credits: 1,
                    }
                });
                console.log("[getUserDiagnoses] Auto-created user:", user.id);
            } else {
                return [];
            }
        }

        const diagnoses = await prisma.diagnosis.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        console.log("[getUserDiagnoses] total records found:", diagnoses.length);

        return diagnoses;
    } catch (error) {
        console.error("Error fetching user diagnoses:", error);
        return [];
    }
}

export async function getDiagnosisById(id: string) {
    try {
        const { userId } = await auth();
        if (!userId) return null;

        const user = await prisma.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) return null;

        const diagnosis = await prisma.diagnosis.findUnique({
            where: { id, userId: user.id },
        });

        return diagnosis;
    } catch (error) {
        console.error("Error fetching diagnosis by id:", error);
        return null;
    }
}
