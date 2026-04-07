import prisma from '../utils/prisma';

export class SettingsService {
    /**
     * Retrieves the global application settings. 
     * If uninitialized, generates a safe default baseline to prevent null execution faults natively.
     */
    static async getGlobalSettings() {
        let settings = await prisma.appSettings.findFirst();
        
        if (!settings) {
            settings = await prisma.appSettings.create({
                data: {
                    companyName: "Aegis Default Enterprise",
                    timbreFiscalPrice: 1.00,
                    defaultTva: 19.00
                }
            });
        }
        return settings;
    }

    /**
     * Updates the single global configuration record.
     */
    static async updateGlobalSettings(data: {
        companyName?: string;
        matriculeFiscal?: string;
        address?: string;
        phone?: string;
        email?: string;
        legalInfo?: string;
        timbreFiscalPrice?: number;
        defaultTva?: number;
    }) {
        const current = await this.getGlobalSettings();
        
        return prisma.appSettings.update({
            where: { id: current.id },
            data: {
                ...data
            }
        });
    }
}
