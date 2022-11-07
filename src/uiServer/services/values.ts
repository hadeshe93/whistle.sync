import { request } from "../utils/request";

export const fetchAllValues = async (hostname: string) => request(`http://${hostname}/cgi-bin/values/list`);
