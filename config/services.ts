export interface Service {
    name: string;
    userPoolClientId: string;
}

export const SERVICES: Service[] = [
   { name: 'example', userPoolClientId: 'clientId' },
]
