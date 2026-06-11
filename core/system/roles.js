export const roles = [
    { name: 'NOVATO', power: 0, req: 0, icon: '👤' },
    { name: 'ACTIVO', power: 1, req: 100, icon: '🌱' },    // 100 mensajes
    { name: 'VETERANO', power: 2, req: 500, icon: '⚔️' },   // 500 mensajes
    { name: 'ELITE', power: 3, req: 1000, icon: '🔥' },    // 1000 mensajes
    { name: 'MODERADOR', power: 4, req: Infinity, icon: '🌸' },
    { name: 'ADMIN', power: 5, req: Infinity, icon: '🛡️' },
    { name: 'OWNER', power: 10, req: Infinity, icon: '👑' }
];

export const getRole = (totalMsgs, currentRole) => {

    if (['MODERADOR', 'ADMIN', 'OWNER'].includes(currentRole)) return currentRole;
    

    const role = [...roles].reverse().find(r => totalMsgs >= r.req && r.req !== Infinity);
    return role ? role.name : 'NOVATO';
};
