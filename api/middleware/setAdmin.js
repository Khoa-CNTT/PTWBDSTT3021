import prisma from "../lib/prisma.js";

const setAdmin = async () => {
    try {
        const email = "tinddinh162003@gmail.com";

        const user = await prisma.user.update({
            where: { email },
            data: { role: "admin" },
        });

        console.log(`User with email ${email} has been set as admin.`);
    } catch (error) {
        console.error("Error setting admin:", error);
    } finally {
        await prisma.$disconnect();
    }
};

setAdmin();