import { sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;
let lastVerificationSendAt = 0;

/**
 * Send verification email to user
 */
export const sendVerificationEmail = async (user) => {
    if (!user) return;

    const now = Date.now();
    if (now - lastVerificationSendAt < VERIFICATION_RESEND_COOLDOWN_MS) {
        throw new Error("Please wait a minute before requesting another verification email.");
    }

    try {
        await sendEmailVerification(user, {
            url: `${window.location.origin}/verify-email`,
            handleCodeInApp: true,
        });
        lastVerificationSendAt = now;
        console.log("Verification email sent!");
        return true;
    } catch (error) {
        const message = error?.code === "auth/too-many-requests"
            ? "Firebase is rate-limiting verification emails. Please wait a few minutes and check your inbox or spam folder."
            : error?.message || "Failed to send verification email";

        console.error("Error sending verification email:", error?.code, error?.message);
        throw new Error(message);
    }
};

/**
 * Check if current user's email is verified
 */
export const isEmailVerified = async () => {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                await user.reload();
                resolve(user.emailVerified);
            } else {
                resolve(false);
            }
        });
    });
};

/**
 * Check verification status (used for polling)
 */
export const checkVerificationStatus = async () => {
    if (!auth.currentUser) return false;

    try {
        await auth.currentUser.reload();
        return auth.currentUser.emailVerified;
    } catch (error) {
        console.error("Error checking verification status:", error.message);
        return false;
    }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
        throw new Error("No user logged in");
    }

    const now = Date.now();
    if (now - lastVerificationSendAt < VERIFICATION_RESEND_COOLDOWN_MS) {
        throw new Error("Please wait a minute before resending the verification email.");
    }

    try {
        await sendEmailVerification(auth.currentUser, {
            url: `${window.location.origin}/verify-email`,
            handleCodeInApp: true,
        });
        lastVerificationSendAt = now;
        return true;
    } catch (error) {
        console.error("Error resending verification email:", error?.code, error?.message);
        if (error?.code === "auth/too-many-requests") {
            throw new Error("Firebase is rate-limiting verification emails. Please wait a few minutes and try again.");
        }
        throw error;
    }
};
