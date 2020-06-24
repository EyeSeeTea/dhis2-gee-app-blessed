export type GeeDataSet = {
    id: string;
    displayName: string;
    description: string;
    imageCollectionId: string;
    bands: GeeBand[];
    doc: string;
};

export type GeeBand = {
    name: string;
    units: string;
    description: string;
};
