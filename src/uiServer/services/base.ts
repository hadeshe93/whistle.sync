import { request } from "../utils/request";

export const fetchInit = async (hostname: string): Promise<{ clientId: string }> => request(`http://${hostname}/cgi-bin/init`);
