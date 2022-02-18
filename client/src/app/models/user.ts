export interface IUser {
    _id: string;
    personalID: number;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    address: {
        city: string;
        street: string;
    };
    isAdmin: boolean;
}
export interface ISessionUser extends Omit<IUser, '_id' | 'personalID' | 'password'> {}