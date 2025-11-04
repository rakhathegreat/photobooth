export const photoServices = {
    upload: () => ({url: '/photo/create', method: 'POST'}),
    getById: (id: string) => ({url: `/photo/get/${id}`, method: 'GET'}),
}