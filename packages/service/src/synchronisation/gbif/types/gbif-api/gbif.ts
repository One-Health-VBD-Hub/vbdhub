import { Country } from './country';
import { GbifRank } from './gbifRank';
import { Language } from './language';
import { Role } from './role';

export interface GbifRawDatasetsResponse {
  offset: number;
  limit: number;
  endOfRecords: boolean;
  count: number;
  results: GbifRawDataset[];
}

interface Tag {
  key: number;
  value: string;
  createdBy: string;
  created: string;
}

interface Comment {
  key: number;
  createdBy: string;
  created: string;
  modifiedBy: string;
  modified: string;
  content: string;
}

interface CuratorialUnitComposite {
  type?: ['SPECIMENS', 'DRAWERS'];
  typeVerbatim?: string;
  deviation?: number;
  count?: number;
  upper?: number;
  lower?: number;
}

interface InterpretedEnumStringRank {
  verbatim: string;
  interpreted: GbifRank;
}

export interface TaxonomicCoverage {
  scientificName: string;
  commonName: string;
  rank?: InterpretedEnumStringRank;
}

export interface TaxonomicCoverages {
  description: string;
  coverages: TaxonomicCoverage[];
}

interface Address {
  key: number;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: Country;
}

interface Collection {
  key: number;
  code: string;
  name: string;
  description: string;
  contentTypes: string[];
  active: boolean;
  personalCollection: boolean;
  doi: string;
  email: string[];
  phone: string[];
  homepage: string;
  catalogUrls: string[];
  apiUrls: string[];
  preservationTypes: string[];
  accessionStatus: string;
  institutionKey: string;
  mailingAddress: Address;
  address: Address;
}

interface DataDescription {
  name: string;
  charset: string;
  url: string;
  format: string;
  formatVersion: string;
}

type Period =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'BIANNUALLY'
  | 'ANNUALLY'
  | 'AS_NEEDED'
  | 'CONTINUALLY'
  | 'IRREGULAR'
  | 'NOT_PLANNED'
  | 'UNKNOWN'
  | 'OTHER_MAINTENANCE_PERIOD';

interface MaintenanceChange {
  changeScope: string;
  changeDate: string;
  comment: string;
  oldValue: Period;
}

export interface GbifRawDataset {
  key: string;
  parentDatasetKey?: string;
  duplicateOfDatasetKey?: string;
  installationKey: string;
  publishingOrganizationKey: string; // hosted by
  doi?: string;
  version?: string;
  external?: boolean;
  numConstituents?: number;
  type:
    | 'OCCURRENCE'
    | 'CHECKLIST'
    | 'METADATA'
    | 'SAMPLING_EVENT'
    | 'MATERIAL_ENTITY';
  subtype?:
    | 'TAXONOMIC_AUTHORITY'
    | 'NOMENCLATOR_AUTHORITY'
    | 'INVENTORY_THEMATIC'
    | 'INVENTORY_REGIONAL'
    | 'GLOBAL_SPECIES_DATASET'
    | 'DERIVED_FROM_OCCURRENCE'
    | 'SPECIMEN'
    | 'OBSERVATION';
  shortName?: string;
  title: string;
  alias?: string;
  abbreviation?: string;
  description?: string;
  language: Language;
  homepage?: string;
  logoUrl?: string;
  citation?: Citation;
  contactsCitation?: ContactsCitation[];
  rights?: string;
  lockedForAutoUpdate?: boolean;
  createdBy?: string;
  modifiedBy?: string;
  created?: string;
  modified?: string;
  deleted?: string;
  contacts: Contact[];
  endpoints: Endpoint[];
  machineTags: MachineTag[];
  tags: Tag[];
  identifiers: Identifier[];
  comments: Comment[];
  bibliographicCitations?: BibliographicCitation[];
  curatorialUnits?: CuratorialUnitComposite[];
  taxonomicCoverages?: TaxonomicCoverages[];
  geographicCoverageDescription?: string;
  geographicCoverages?: GeographicCoverage[];
  temporalCoverages?: TemporalCoverage[];
  keywordCollections?: KeywordCollection[];
  project?: Project;
  samplingDescription?: SamplingDescription;
  countryCoverage?: Country[];
  collections?: Collection[];
  dataDescriptions?: DataDescription[];
  dataLanguage?: Language;
  purpose?: string;
  introduction?: string;
  gettingStarted?: string;
  acknowledgements?: string;
  additionalInfo?: string;
  pubDate?: string; // publication date
  maintenanceUpdateFrequency?: Period;
  maintenanceDescription?: string;
  maintenanceChangeHistory?: MaintenanceChange[];
  license?: License;
}

type License =
  | 'CC0_1_0'
  | 'CC_BY_4_0'
  | 'CC_BY_NC_4_0'
  | 'UNSPECIFIED'
  | 'UNSUPPORTED'; // https://api.gbif.org/v1/enumeration/basic/License

export interface Citation {
  text: string;
  identifier: string;
  citationProvidedBySource: boolean;
}

export interface ContactsCitation {
  key: number;
  abbreviatedName: string;
  firstName?: string;
  lastName: string;
  roles: Role[];
  userId: string[];
}

export interface Endpoint {
  key: number;
  type: string;
  url?: string;
  description?: string;
  createdBy?: string;
  modifiedBy?: string;
  created: string;
  modified: string;
  machineTags: MachineTag[];
}

export interface MachineTag {
  key: number;
  namespace: string;
  name: string;
  value: string;
  createdBy?: string;
  created: string;
}

export interface Identifier {
  key: number;
  type: string;
  identifier: string;
  createdBy: string;
  created: string;
}

export interface BibliographicCitation {
  text: string;
  citationProvidedBySource: boolean;
}

export interface GeographicCoverage {
  description: string;
  boundingBox: BoundingBox;
}

export interface BoundingBox {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
  globalCoverage: boolean;
}

export interface TemporalCoverage {
  '@type': string;
  start: string;
  end: string;
}

export interface KeywordCollection {
  thesaurus: string;
  keywords: string[];
}

interface RelatedProject {
  title?: string;
  identifier?: string;
  abstract?: string;
  contacts?: Contact[];
}

interface ProjectAward {
  funderName: string;
  funderIdentifiers?: string[];
  awardNumber?: string;
  title: string;
  awardUrl?: string;
}

export interface Project {
  title?: string;
  description?: string;
  identifier?: string;
  contacts?: Contact[];
  funding?: string[];
  awards?: ProjectAward[];
  relatedProjects?: RelatedProject[];
  designDescription?: string;
  studyAreaDescription?: string;
  abstract?: string;
}

export interface Contact {
  key: number;
  type?: string;
  primary?: boolean;
  userId?: string[];
  salutation?: string;
  firstName?: string;
  lastName?: string;
  position?: string[];
  description?: string;
  email?: string[];
  phone?: string[];
  homepage: string[];
  organization?: string;
  address?: string[];
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  createdBy?: string;
  modifiedBy?: string;
  created: string;
  modified: string; // metadata last modified
}

export interface SamplingDescription {
  studyExtent?: string;
  sampling?: string;
  qualityControl?: string;
  methodSteps?: string[];
}
