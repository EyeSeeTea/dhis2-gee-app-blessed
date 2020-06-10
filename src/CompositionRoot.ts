import { D2Api, D2ApiDefault } from "d2-api";
import DataElementD2ApiRepository from "./data/DataElementD2ApiRepository";
import { GetDataElementsUseCase } from "./domain/usecases/GetDataElementsUseCase";
import ImportUseCase from "./domain/usecases/ImportUseCase";
import { Config } from "./webapp/models/Config";
import { GeeDataEarthEngineRepository } from "./data/GeeDataValueSetApiRepository";
import OrgUnitD2ApiRepository from "./data/OrgUnitD2ApiRepository";
import DataValueSetD2ApiRepository from "./data/DataValueSetD2ApiRepository";
import { GeeDataSetConfigRepository } from "./data/GeeDataSetConfigRepository";
import DataValueSetFileRepository from "./data/DataValueSetFileRepository";
import ImportRuleD2ApiRepository from "./data/ImportRuleD2ApiRepository";
import { GetImportRulesUseCase } from "./domain/usecases/GetImportRulesUseCase";
import { ImportRuleRepository } from "./domain/repositories/ImportRuleRepository";
import { DeleteImportRulesUseCase } from "./domain/usecases/DeleteImportRulesUseCase";
import { GetImportRuleByIdUseCase } from "./domain/usecases/GetImportRuleByIdUseCase";
import { UpdateImportRuleUseCase } from "./domain/usecases/UpdateImportRuleUseCase";
import MappingD2ApiRepository from "./data/MappingD2ApiRepository";
import { CreateImportRuleUseCase } from "./domain/usecases/CreateImportRuleUseCase";
import { DeleteMappingsUseCase } from "./domain/usecases/DeleteMappingsUseCase";
import ImportSummaryD2ApiRepository from "./data/ImportSummaryD2ApiRepository";
import { GetImportSummariesUseCase } from "./domain/usecases/GetImportSummariesUseCase";
import { DeleteImportSummariesUseCase } from "./domain/usecases/DeleteImportSummariesUseCase";
import { GetOrgUnitsWithCoordinatesUseCase } from "./domain/usecases/GetOrgUnitsWithCoordinatesUseCase";
import { CreateGlobalOUMappingUseCase } from "./domain/usecases/CreateGlobalOUMappingUseCase";
import { GetGlobalOUMappingByMappingIdUseCase } from "./domain/usecases/GetGlobalOUMappingByMappingIdUseCase";
import GlobalOUMappingD2ApiRepository from "./data/GlobalOUMappingD2ApiRepository";
import { DeleteGlobalOUMappingUseCase } from "./domain/usecases/DeleteGlobalOUMappingUseCase";

interface Type<T> {
    new (...args: any[]): T;
}

export type NamedToken = "importUseCase" | "downloadUseCase";

type PrivateNamedToken = "dataStore" | "importRuleRepository" | "importSummaryRepository";

type Token<T> = Type<T> | NamedToken | PrivateNamedToken;

class CompositionRoot {
    private d2Api: D2Api;

    private dependencies = new Map<Token<any>, any>();

    constructor(baseUrl: string, private config: Config) {
        this.d2Api = new D2ApiDefault({ baseUrl });

        this.initializeDataStore();
        this.initializeGlobalOUMappings();
        this.initializeOrgUnits();
        this.initializeDataElements();
        this.initializeImportsHistory();
        this.initializeImportRules();
        this.initializeImportAndDownload();
        this.initializeMapping();
    }

    public get<T>(token: Type<T> | NamedToken): T {
        return this.dependencies.get(token);
    }

    public bind<T>(token: Type<T> | NamedToken, value: T) {
        this.dependencies.set(token, value);
    }

    public importRules() {
        return {
            getById: this.get(GetImportRuleByIdUseCase),
            getAll: this.get(GetImportRulesUseCase),
            create: this.get(CreateImportRuleUseCase),
            update: this.get(UpdateImportRuleUseCase),
            delete: this.get(DeleteImportRulesUseCase),
        };
    }

    public importSummaries() {
        return {
            getAll: this.get(GetImportSummariesUseCase),
            delete: this.get(DeleteImportSummariesUseCase),
        };
    }

    public geeImport() {
        return {
            import: this.get<ImportUseCase>("importUseCase"),
            download: this.get<ImportUseCase>("downloadUseCase"),
        };
    }

    public dataElements() {
        return {
            getByDataSet: this.get(GetDataElementsUseCase),
        };
    }

    public orgUnits() {
        return {
            getWithCoordinates: this.get(GetOrgUnitsWithCoordinatesUseCase),
        };
    }

    public globalOUMapping() {
        return {
            getByMappingId: this.get(GetGlobalOUMappingByMappingIdUseCase),
            create: this.get(CreateGlobalOUMappingUseCase),
            delete: this.get(DeleteGlobalOUMappingUseCase),
        };
    }

    public mapping() {
        return {
            delete: this.get(DeleteMappingsUseCase),
        };
    }

    private initializeDataStore() {
        const dataStore = this.d2Api.dataStore(this.config.data.base.dataStore.namespace);
        this.dependencies.set("dataStore", dataStore);
    }

    private initializeDataElements() {
        const dataElementsRepository = new DataElementD2ApiRepository(this.d2Api);
        const getDataElementsUseCase = new GetDataElementsUseCase(dataElementsRepository);
        this.dependencies.set(GetDataElementsUseCase, getDataElementsUseCase);
    }

    private initializeOrgUnits() {
        const orgUnitRepository = new OrgUnitD2ApiRepository(this.d2Api);
        const getOrgUnitsWithCoordinatesUseCase = new GetOrgUnitsWithCoordinatesUseCase(
            orgUnitRepository
        );
        this.dependencies.set(GetOrgUnitsWithCoordinatesUseCase, getOrgUnitsWithCoordinatesUseCase);
    }

    private initializeImportRules() {
        const importRuleRepository = new ImportRuleD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.importRules,
            this.config.data.base.dataStore.keys.imports.suffix
        );
        this.dependencies.set("importRuleRepository", importRuleRepository);

        const getImportRuleById = new GetImportRuleByIdUseCase(importRuleRepository);
        const getImportRulesUseCase = new GetImportRulesUseCase(importRuleRepository);
        const createImportRuleUseCase = new CreateImportRuleUseCase(importRuleRepository);
        const updateImportRuleUseCase = new UpdateImportRuleUseCase(importRuleRepository);

        const importSummaryRepository = this.dependencies.get("importSummaryRepository");

        const deleteImportRulesUseCase = new DeleteImportRulesUseCase(
            importRuleRepository,
            importSummaryRepository
        );

        this.dependencies.set(GetImportRuleByIdUseCase, getImportRuleById);
        this.dependencies.set(GetImportRulesUseCase, getImportRulesUseCase);
        this.dependencies.set(CreateImportRuleUseCase, createImportRuleUseCase);
        this.dependencies.set(UpdateImportRuleUseCase, updateImportRuleUseCase);
        this.dependencies.set(DeleteImportRulesUseCase, deleteImportRulesUseCase);
    }

    initializeGlobalOUMappings() {
        const globalOrgUnitMappingRepository = new GlobalOUMappingD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.globalOUMapping
        );

        const createGlobalOrgUnitMappingUseCase = new CreateGlobalOUMappingUseCase(
            globalOrgUnitMappingRepository
        );
        const getGlobalOUMappingByMappingIdUseCase = new GetGlobalOUMappingByMappingIdUseCase(
            globalOrgUnitMappingRepository
        );
        const deleteGlobalOUMappingUseCase = new DeleteGlobalOUMappingUseCase(
            globalOrgUnitMappingRepository
        );

        this.dependencies.set(CreateGlobalOUMappingUseCase, createGlobalOrgUnitMappingUseCase);
        this.dependencies.set(
            GetGlobalOUMappingByMappingIdUseCase,
            getGlobalOUMappingByMappingIdUseCase
        );
        this.dependencies.set(DeleteGlobalOUMappingUseCase, deleteGlobalOUMappingUseCase);
    }

    initializeImportsHistory() {
        const importSummaryRepository = new ImportSummaryD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.importsHistory
        );
        this.dependencies.set("importSummaryRepository", importSummaryRepository);

        const getImportSummariesUseCase = new GetImportSummariesUseCase(importSummaryRepository);
        const deleteImportSummariesUseCase = new DeleteImportSummariesUseCase(
            importSummaryRepository
        );

        this.dependencies.set(GetImportSummariesUseCase, getImportSummariesUseCase);
        this.dependencies.set(DeleteImportSummariesUseCase, deleteImportSummariesUseCase);
    }

    private initializeImportAndDownload() {
        const importRuleRepository = this.dependencies.get(
            "importRuleRepository"
        ) as ImportRuleRepository;

        const mappingRepository = new MappingD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.mappings
        );

        const geeDataSetRepository = new GeeDataSetConfigRepository(this.config);
        const geeDataRepository = new GeeDataEarthEngineRepository(this.d2Api);
        const orgUnitsRepository = new OrgUnitD2ApiRepository(this.d2Api);
        const dataValueSetD2ApiRepository = new DataValueSetD2ApiRepository(this.d2Api);
        const dataValueSetFileRepository = new DataValueSetFileRepository();
        const importSummaryRepository = new ImportSummaryD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.importsHistory
        );

        const importUseCase = new ImportUseCase(
            importRuleRepository,
            mappingRepository,
            geeDataSetRepository,
            geeDataRepository,
            orgUnitsRepository,
            dataValueSetD2ApiRepository,
            importSummaryRepository
        );

        const downloadUseCase = new ImportUseCase(
            importRuleRepository,
            mappingRepository,
            geeDataSetRepository,
            geeDataRepository,
            orgUnitsRepository,
            dataValueSetFileRepository,
            importSummaryRepository
        );

        this.dependencies.set("importUseCase", importUseCase);
        this.dependencies.set("downloadUseCase", downloadUseCase);
    }

    private initializeMapping() {
        const mappingRepository = new MappingD2ApiRepository(
            this.dependencies.get("dataStore"),
            this.config.data.base.dataStore.keys.mappings
        );

        const importRuleRepository = this.dependencies.get(
            "importRuleRepository"
        ) as ImportRuleRepository;

        const deleteMappingsUseCase = new DeleteMappingsUseCase(
            mappingRepository,
            importRuleRepository
        );

        this.dependencies.set(DeleteMappingsUseCase, deleteMappingsUseCase);
    }
}

export default CompositionRoot;
