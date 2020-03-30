const colors = {
    'a3a0b357-39ff-4f9d-9090-ef84bf778eb2': '#6975A6',
    '01a4dd0f-742c-416b-9458-dba2d1d34a79': '#F28A30',
    'c110fc00-796f-4dc6-9fa3-74c6afaaefb8': '#F05837',
    'b31d14bf-cfd5-4033-84c1-1eea404f5a25': '#0584F2',
    '0f219d9d-d016-4b54-8dbf-8072c84ee016': '#A7414A',
    'f022e726-4d1c-43b8-8b86-a48984910266': '#00743F',
    '0c23b50c-e486-4cdb-b36b-b14031c3df9e': '#888C46',
    'b08b3cb2-d4ba-445e-bff4-aac8fd7d183b': '#A3586D',
    '6593a769-f8bc-417a-ade5-a69cdb884693': '#0ABDA0'
}

export const colorForCourse = (id: string): string =>
    colors[id] || '#8D2F23'
