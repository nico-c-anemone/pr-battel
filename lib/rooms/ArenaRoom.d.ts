import { Room, Client } from "colyseus";
import { State } from "./State";
export declare class ArenaRoom extends Room<State> {
    onInit(): void;
    onJoin(client: Client, options: any): void;
    onMessage(client: Client, message: any): void;
    onLeave(client: Client): void;
}
