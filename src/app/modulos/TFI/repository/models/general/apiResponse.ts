export interface WebApiResponse<T> {
    success: boolean;
    response: Response<T>;
    errors: Error[];
}

export interface Response<T> {
    data: T;
}

export interface Error {
    code: number;
    message: string;
}