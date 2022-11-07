import { request } from "../utils/request";

export const fetchAllRules = async (hostname: string) => request(`http://${hostname}/cgi-bin/rules/list`);
