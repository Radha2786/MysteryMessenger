import {resend} from '@/lib/resend';

import VerificationEmail from '../../emails/VerificationEmail';

import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationemail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
    try{
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Mystery Message | verification code',
            react: VerificationEmail({username, otp: verifyCode}),
          });
          return { success: true, message: 'Verification email sent successfully.' };

    } catch(emailError){
        console.log("error sending verification email", emailError);
        return {success:false, message:"Error sending verification email"};
    }
}