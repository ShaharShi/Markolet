export const errorMessages = {
    allParametersAreRequired: 'All parameters are required !',
    invalidField: (unit: string, requireAs: string) => `${unit} field must be a valid ${requireAs}!`,
    invalidIdField: (type: string) => `There isn\'t ${type} with the given ID`,
    noProductFound: 'There is no product thats meet these parameters !',
    internalError: 'Internal Error, please refresh the page and try again ...',
    userAlreadyExists: 'User already exists !',
    incorrectParameters: 'Incorrect user name or password, try again !',
    unknownToken: 'Autorization Error, unknown token !',
    permissionDenied: 'You don\'t have the permission to perform this operation.',
}