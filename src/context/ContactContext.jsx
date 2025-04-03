"use client";

import { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

const ContactContext = createContext();

export function ContactProvider({ children }) {
    const [contacts, setContacts] = useState([]);

    const getContacts = useCallback(async () => {
        try {
            const response = await api.get("/contacts");
            setContacts(response.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
            throw error;
        }
    }, []);

    const getContact = useCallback(async (id) => {
        try {
            const response = await api.get(`/contacts/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching contact:", error);
            throw error;
        }
    }, []);

    const createContact = useCallback(async (contactData) => {
        try {
            const response = await api.post("/contacts", contactData);
            setContacts((prev) => [...prev, response.data]);
            return response.data;
        } catch (error) {
            console.error("Error creating contact:", error);
            throw error;
        }
    }, []);

    const updateContact = useCallback(async (id, contactData) => {
        try {
            const response = await api.put(`/contacts/${id}`, contactData);
            setContacts((prev) =>
                prev.map((contact) =>
                    contact.id === id ? response.data : contact
                )
            );
            return response.data;
        } catch (error) {
            console.error("Error updating contact:", error);
            throw error;
        }
    }, []);

    const deleteContact = useCallback(async (id) => {
        try {
            await api.delete(`/contacts/${id}`);
            setContacts((prev) => prev.filter((contact) => contact.id !== id));
        } catch (error) {
            console.error("Error deleting contact:", error);
            throw error;
        }
    }, []);

    const value = {
        contacts,
        getContacts,
        getContact,
        createContact,
        updateContact,
        deleteContact,
    };

    return (
        <ContactContext.Provider value={value}>
            {children}
        </ContactContext.Provider>
    );
}

export function useContacts() {
    const context = useContext(ContactContext);
    if (!context) {
        throw new Error("useContacts must be used within a ContactProvider");
    }
    return context;
}
