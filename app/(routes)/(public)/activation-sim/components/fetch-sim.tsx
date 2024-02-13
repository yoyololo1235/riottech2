"use server";

import axios from "axios";

export type ValidSim = {
    RTsubIDs: string[];
    available: boolean;
    group: string;
    is_third: boolean;
    org_image_url: string;
    org_name: string;
    sim_serial: string;
};

export const FetchSim = async (sim: string): Promise<ValidSim> => {
    try {
        const response = await axios.get(
            `https://webtool.riottech.fr/public_routes/netsim/getSimAvailability/${sim}`,
        );
        if (response.data.available) {
            return response.data as ValidSim;
        }
        return {
            RTsubIDs: [],
            available: false,
            group: "",
            is_third: false,
            org_image_url: "",
            org_name: "",
            sim_serial: "",
        };
    } catch (error) {
        return {
            RTsubIDs: [],
            available: false,
            group: "",
            is_third: false,
            org_image_url: "",
            org_name: "",
            sim_serial: "",
        };
    }
};