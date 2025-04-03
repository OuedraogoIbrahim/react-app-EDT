import { z } from "zod";

export const contactSchema = z.object({
    prenom: z
        .string()
        .min(1, "First name is required")
        .max(50, "First name must be less than 50 characters"),
    nom: z
        .string()
        .min(1, "Last name is required")
        .max(50, "Last name must be less than 50 characters"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    telephone: z
        .string()
        .min(1, "Phone number is required")
        .regex(
            /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
            "Invalid phone number format"
        ),
    adresse: z.string().optional(),
    notes: z.string().optional(),
});

export const validators = {
    required: (value) => {
        return value ? null : "Ce champ est requis";
    },

    minLength: (length) => (value) => {
        return value && value.length >= length
            ? null
            : `Le mot de passe doit contenir au moins ${length} caractères`;
    },

    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : "Email invalide";
    },

    phone: (value) => {
        const phoneRegex =
            /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        return phoneRegex.test(value) ? null : "Numéro de téléphone invalide";
    },

    validateForm: (values, rules) => {
        const errors = {};
        Object.keys(rules).forEach((field) => {
            const fieldRules = rules[field];
            for (const rule of fieldRules) {
                const error = rule(values[field]);
                if (error) {
                    errors[field] = error;
                    break;
                }
            }
        });
        return errors;
    },
};
