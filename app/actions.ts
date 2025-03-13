"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const username = formData.get("username")?.toString();
    const gender = formData.get("gender")?.toString();
    const supabase = await createClient();

    if (!email || !password || !username || !gender) {
        return encodedRedirect(
            "error",
            "/home",
            "Please fill out all fields and try again.",
        );
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    const { error: userError } = await supabase.from("users").insert({
        username,
        gender,
        account_id: data?.user?.id,
    })

    if (userError) {
        console.error(userError.code + " " + userError.message);
        return encodedRedirect("error", "/home", userError.message);
    }

    if (error) {
        console.error(error.code + " " + error.message);
        return encodedRedirect("error", "/home", error.message);
    } else {
        return encodedRedirect(
            "success",
            "/home",
            "Thanks for signing up! Please check your email for a verification link.",
        );
    }
};