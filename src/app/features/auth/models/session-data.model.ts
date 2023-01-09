import { TokenData } from "./token-data.model";
import { UserDto } from "./user.model";

export interface SessionData {
    user: UserDto;
    tokenData: TokenData;
}