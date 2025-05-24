import axios from "axios";
import { get } from "http";

export default async function getBranches(url: string, token?: string) {
    const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await axios.get(`${url}/branches`, { headers });
    if (res.status !== 200) {
        throw new Error(`Error fetching branches: ${res.statusText}`);
    }

    const branches = Array.isArray(res.data) ? res.data : [];
    return branches.map((branch: { name: string }) => branch.name);
}


// Example usage:
// (async () => {
//     try {
//         const branches = await getBranches("https://api.github.com/repos/microsoft/vscode");
//         console.log(branches);
//     } catch (error) {
//         console.error(error);
//     }
// })();