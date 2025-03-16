"use client"
import { CheckCircle2 } from "lucide-react"

interface SuccessStepProps {
    formData: {
        email: string
        username: string
        gender: string
    }
}

export default function SuccessStep({ formData }: SuccessStepProps) {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Account Created Successfully!</h3>
            <p className="text-muted-foreground">
                Welcome, {formData.username}! Your account has been created with the email {formData.email}.
            </p>
        </div>
    )
}

