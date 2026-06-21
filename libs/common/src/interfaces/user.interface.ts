export interface UserProfileResponse {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}