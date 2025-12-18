import {
  XmlElem,
  XmlChildElem,
  XmlAttribute,
  XmlChardata,
  xmlToClass
} from 'xml-class-transformer';
import { IsNotEmpty, IsOptional, validate } from 'class-validator';
import { Logger } from '@nestjs/common';

export type HostingRepositoryType =
  | 'PRIDE'
  | 'PeptideAtlas'
  | 'PASSEL'
  | 'TestRepo'
  | 'MassIVE'
  | 'iProX'
  | 'jPOST'
  | 'Firmiana'
  | 'PanoramaPublic';

export type VersionRegex = string; // e.g. "1.4.x"

/* Abstract Parameter and Derived Types */
@XmlElem({ name: 'AbstractParam' }) // abstract placeholder; not directly used in XML
export abstract class AbstractParamType {
  @XmlAttribute({ name: 'name', type: () => String })
  name: string;

  @IsOptional()
  @XmlAttribute({ name: 'value', type: () => String })
  value?: string;

  @IsOptional()
  @XmlAttribute({ name: 'unitAccession', type: () => String })
  unitAccession?: string;

  @IsOptional()
  @XmlAttribute({ name: 'unitName', type: () => String })
  unitName?: string;

  @IsOptional()
  @XmlAttribute({ name: 'unitCvRef', type: () => String })
  unitCvRef?: string;
}

@XmlElem({ name: 'userParam' })
export class UserParamType extends AbstractParamType {
  @XmlAttribute({ name: 'name', type: () => String })
  declare name: string;

  @IsOptional()
  @XmlAttribute({ name: 'value', type: () => String })
  declare value?: string;

  @IsOptional()
  @XmlAttribute({ name: 'unitAccession', type: () => String })
  declare unitAccession?: string;

  @IsOptional()
  @XmlAttribute({ name: 'unitName', type: () => String })
  declare unitName?: string;

  @IsOptional()
  @XmlAttribute({ name: 'unitCvRef', type: () => String })
  declare unitCvRef?: string;
}

@XmlElem({ name: 'cvParam' })
export class CvParamType extends AbstractParamType {
  @XmlAttribute({ name: 'cvRef', type: () => String })
  cvRef: string; // xs:IDREF

  @XmlAttribute({ name: 'accession', type: () => String })
  accession: string;

  @XmlAttribute({ name: 'name', type: () => String })
  declare name:
    | 'ProteomeXchange accession number'
    | 'Digital Object Identifier (DOI)'
    | 'Dataset FTP location'
    | 'PRIDE project URI'
    | 'taxonomy: scientific name'
    | 'taxonomy: NCBI TaxID';

  @IsOptional()
  @XmlAttribute({ name: 'value', type: () => String })
  declare value?: string;

  @IsOptional()
  @XmlAttribute({ name: 'unitAccession', type: () => String })
  declare unitAccession?: string;

  @IsOptional()
  @XmlAttribute({ name: 'unitName', type: () => String })
  declare unitName?: string;

  @IsOptional()
  @XmlAttribute({ name: 'unitCvRef', type: () => String })
  declare unitCvRef?: string;
}

/* RefType */
@XmlElem({ name: 'Ref' })
export class RefType {
  @XmlAttribute({ name: 'ref', type: () => String })
  ref: string; // xs:IDREF
}

/* Cv and CvList */
@XmlElem({ name: 'Cv' })
export class CvType {
  @XmlAttribute({ name: 'fullName', type: () => String })
  fullName: string;

  @IsOptional()
  @XmlAttribute({ name: 'version', type: () => String })
  version?: string;

  @XmlAttribute({ name: 'uri', type: () => String })
  uri: string;

  @XmlAttribute({ name: 'id', type: () => String })
  id: string; // xs:ID
}

@XmlElem({ name: 'CvList' })
export class CvListType {
  @XmlChildElem({ type: () => CvType, array: true })
  Cv: CvType[];
}

/* AdditionalInformationType */
@XmlElem({ name: 'AdditionalInformation' })
export class AdditionalInformationType {
  @IsOptional()
  @XmlChildElem({ type: () => CvParamType, array: true })
  cvParam?: CvParamType[];

  @IsOptional()
  @XmlChildElem({ type: () => UserParamType, array: true })
  userParam?: UserParamType[];
}

/* ChangeLogType and ChangeLogEntryType */
@XmlElem({ name: 'ChangeLog' })
export class ChangeLogType {
  @XmlChildElem({ type: () => ChangeLogEntryType, array: true })
  ChangeLogEntry: ChangeLogEntryType[];
}

@XmlElem({ name: 'ChangeLogEntry' })
export class ChangeLogEntryType {
  @IsOptional()
  @XmlAttribute({ name: 'version', type: () => String })
  version?: string;

  @IsOptional()
  @XmlAttribute({ name: 'date', type: () => String })
  date?: string; // xs:date

  @XmlChardata({ type: () => String })
  content: string;
}

/* ContactListType and ContactType */
@XmlElem({ name: 'ContactList' })
export class ContactListType {
  @XmlChildElem({ type: () => ContactType, array: true })
  Contact: ContactType[];
}

@XmlElem({ name: 'Contact' })
export class ContactType {
  @XmlChildElem({ type: () => CvParamType, array: true })
  cvParam: CvParamType[];

  @XmlAttribute({ name: 'id', type: () => String })
  id: string; // xs:ID
}

/* DatasetFileListType and DatasetFileType */
@XmlElem({ name: 'DatasetFileList' })
export class DatasetFileListType {
  @XmlChildElem({ type: () => DatasetFileType, array: true })
  DatasetFile: DatasetFileType[];
}

@XmlElem({ name: 'DatasetFile' })
export class DatasetFileType {
  @XmlChildElem({ type: () => CvParamType, array: true })
  cvParam: CvParamType[];

  @XmlAttribute({ name: 'id', type: () => String })
  id: string; // xs:ID

  @XmlAttribute({ name: 'name', type: () => String })
  name: string;
}

/* DatasetIdentifierListType and DatasetIdentifierType */
@XmlElem({ name: 'DatasetIdentifierList' })
export class DatasetIdentifierListType {
  @XmlChildElem({ type: () => DatasetIdentifierType, array: true })
  DatasetIdentifier: DatasetIdentifierType[];
}

@XmlElem({ name: 'DatasetIdentifier' })
export class DatasetIdentifierType {
  @XmlChildElem({ type: () => CvParamType, array: true })
  cvParam: CvParamType[];
}

/* DatasetOriginListType and DatasetOriginType */
@XmlElem({ name: 'DatasetOriginList' })
export class DatasetOriginListType {
  @XmlChildElem({ type: () => DatasetOriginType, array: true })
  DatasetOrigin: DatasetOriginType[];
}

@XmlElem({ name: 'DatasetOrigin' })
export class DatasetOriginType {
  @XmlChildElem({ type: () => CvParamType, array: true })
  cvParam: CvParamType[];
}

@XmlElem({ name: 'ReviewLevel' })
export class ReviewLevelType {
  @XmlChildElem({ type: () => CvParamType })
  cvParam: CvParamType;
}

@XmlElem({ name: 'RepositorySupport' })
export class RepositorySupportType {
  @XmlChildElem({ type: () => CvParamType })
  cvParam: CvParamType;
}

/* DatasetSummaryType, ReviewLevelType, RepositorySupportType */
@XmlElem({ name: 'DatasetSummary' })
export class DatasetSummaryType {
  @XmlChildElem({ type: () => String, name: 'Description' })
  Description: string;

  @XmlChildElem({ type: () => ReviewLevelType })
  ReviewLevel: ReviewLevelType;

  @XmlChildElem({ type: () => RepositorySupportType })
  RepositorySupport: RepositorySupportType;

  @XmlAttribute({ name: 'announceDate', type: () => String })
  announceDate: string; // xs:date

  @IsNotEmpty()
  @XmlAttribute({ name: 'hostingRepository', type: () => String })
  hostingRepository: HostingRepositoryType;

  @XmlAttribute({ name: 'title', type: () => String })
  title: string;
}

/* FullDatasetLinkListType and FullDatasetLinkType */
@XmlElem({ name: 'FullDatasetLinkList' })
export class FullDatasetLinkListType {
  @XmlChildElem({ type: () => FullDatasetLinkType, array: true })
  FullDatasetLink: FullDatasetLinkType[];
}

@XmlElem({ name: 'FullDatasetLink' })
export class FullDatasetLinkType {
  @XmlChildElem({ type: () => CvParamType })
  cvParam: CvParamType;
}

/* InstrumentListType and InstrumentType */
@XmlElem({ name: 'InstrumentList' })
export class InstrumentListType {
  @XmlChildElem({ type: () => InstrumentType, array: true })
  Instrument: InstrumentType[];
}

@XmlElem({ name: 'Instrument' })
export class InstrumentType {
  @XmlChildElem({ type: () => CvParamType, array: true })
  cvParam: CvParamType[];

  @XmlAttribute({ name: 'id', type: () => String })
  id: string; // xs:ID
}

/* KeywordListType */
@XmlElem({ name: 'KeywordList' })
export class KeywordListType {
  @XmlChildElem({ type: () => CvParamType, array: true })
  cvParam: CvParamType[];
}

/* ModificationListType */
@XmlElem({ name: 'ModificationList' })
export class ModificationListType {
  @XmlChildElem({ type: () => CvParamType, array: true })
  cvParam: CvParamType[];
}

/* PublicationListType and PublicationType */
@XmlElem({ name: 'PublicationList' })
export class PublicationListType {
  @XmlChildElem({ type: () => PublicationType, array: true })
  Publication: PublicationType[];
}

@XmlElem({ name: 'Publication' })
export class PublicationType {
  @XmlChildElem({ type: () => CvParamType, array: true })
  cvParam: CvParamType[];

  @XmlAttribute({ name: 'id', type: () => String })
  id: string; // xs:ID
}

/* RepositoryRecordListType and RepositoryRecordType */
@XmlElem({ name: 'RepositoryRecordList' })
export class RepositoryRecordListType {
  @XmlChildElem({ type: () => RepositoryRecordType, array: true })
  RepositoryRecord: RepositoryRecordType[];
}

/* SampleListType and SampleType */
@XmlElem({ name: 'SampleList' })
export class SampleListType {
  @XmlChildElem({ type: () => SampleType, array: true })
  Sample: SampleType[];
}

@XmlElem({ name: 'RepositoryRecord' })
export class RepositoryRecordType {
  @IsOptional()
  @XmlChildElem({
    type: () => RefType,
    name: 'SourceFileRef',
    array: true
  })
  SourceFileRef?: RefType[];

  @IsOptional()
  @XmlChildElem({
    type: () => RefType,
    name: 'PublicationRef',
    array: true
  })
  PublicationRef?: RefType[];

  @IsOptional()
  @XmlChildElem({
    type: () => RefType,
    name: 'InstrumentRef',
    array: true
  })
  InstrumentRef?: RefType[];

  @IsOptional()
  @XmlChildElem({ type: () => SampleListType })
  SampleList?: SampleListType;

  @IsOptional()
  @XmlChildElem({ type: () => ModificationListType })
  ModificationList?: ModificationListType;

  @IsOptional()
  @XmlChildElem({
    type: () => AdditionalInformationType,
    name: 'AnnotationList'
  })
  AnnotationList?: AdditionalInformationType;

  @XmlAttribute({ name: 'name', type: () => String })
  name: string;

  @IsOptional()
  @XmlAttribute({ name: 'label', type: () => String })
  label?: string;

  @XmlAttribute({ name: 'recordID', type: () => String })
  recordID: string;

  @XmlAttribute({ name: 'repositoryID', type: () => String })
  repositoryID: HostingRepositoryType;

  @XmlAttribute({ name: 'uri', type: () => String })
  uri: string; // xs:anyURI
}

@XmlElem({ name: 'Sample' })
export class SampleType {
  @XmlChildElem({ type: () => CvParamType, array: true })
  cvParam: CvParamType[];

  @XmlAttribute({ name: 'name', type: () => String })
  name: string;
}

/* SpeciesListType and SpeciesType */
@XmlElem({ name: 'SpeciesList' })
export class SpeciesListType {
  @XmlChildElem({ type: () => SpeciesType, array: true })
  Species: SpeciesType[];
}

@XmlElem({ name: 'Species' })
export class SpeciesType {
  @XmlChildElem({ type: () => CvParamType, array: true })
  cvParam: CvParamType[];
}

// Top-Level ProteomeXchangeDataset Type,
// derived from https://proteomecentral.proteomexchange.org/schemas/proteomeXchange-1.4.0.xsd
@XmlElem({ name: 'ProteomeXchangeDataset' })
export class ProteomeXchangeDatasetType {
  @XmlAttribute({ name: 'id', type: () => String })
  id: string;

  @XmlAttribute({ name: 'formatVersion', type: () => String })
  formatVersion: VersionRegex;

  @XmlChildElem({ type: () => CvListType })
  CvList: CvListType;

  @IsOptional()
  @XmlChildElem({ type: () => ChangeLogType })
  ChangeLog?: ChangeLogType;

  @XmlChildElem({ type: () => DatasetSummaryType })
  DatasetSummary: DatasetSummaryType;

  @XmlChildElem({ type: () => DatasetIdentifierListType })
  DatasetIdentifierList: DatasetIdentifierListType;

  @XmlChildElem({ type: () => DatasetOriginListType })
  DatasetOriginList: DatasetOriginListType;

  @XmlChildElem({ type: () => SpeciesListType })
  SpeciesList: SpeciesListType;

  @XmlChildElem({ type: () => InstrumentListType })
  InstrumentList: InstrumentListType;

  @XmlChildElem({ type: () => ModificationListType })
  ModificationList: ModificationListType;

  @XmlChildElem({ type: () => ContactListType })
  ContactList: ContactListType;

  @XmlChildElem({ type: () => PublicationListType })
  PublicationList: PublicationListType;

  @XmlChildElem({ type: () => KeywordListType })
  KeywordList: KeywordListType;

  @XmlChildElem({ type: () => FullDatasetLinkListType })
  FullDatasetLinkList: FullDatasetLinkListType;

  @IsOptional()
  @XmlChildElem({ type: () => DatasetFileListType })
  DatasetFileList?: DatasetFileListType;

  @IsOptional()
  @XmlChildElem({ type: () => RepositoryRecordListType })
  RepositoryRecordList?: RepositoryRecordListType;

  @IsOptional()
  @XmlChildElem({ type: () => AdditionalInformationType })
  AdditionalInformation?: AdditionalInformationType;
}

export function getIdentifiers(obs: ProteomeXchangeDatasetType) {
  const res: { pxId?: string; doi?: string } = {};

  for (const identifier of obs.DatasetIdentifierList.DatasetIdentifier) {
    for (const cvParamType of identifier.cvParam) {
      if (cvParamType.name === 'ProteomeXchange accession number') {
        res.pxId = cvParamType.value;
      } else if (cvParamType.name === 'Digital Object Identifier (DOI)') {
        res.doi = cvParamType.value;
      }
    }
  }

  return res;
}

const xmlData = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ProteomeXchangeDataset id="PXD000001" formatVersion="1.4.0" xsi:noNamespaceSchemaLocation="proteomeXchange-1.4.0.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <CvList>
        <Cv fullName="PSI-MS" uri="https://raw.githubusercontent.com/HUPO-PSI/psi-ms-CV/master/psi-ms.obo" id="MS"/>
        <Cv fullName="PSI-MOD" uri="https://raw.githubusercontent.com/MICommunity/psidev/master/psi/mod/data/PSI-MOD.obo" id="MOD"/>
        <Cv fullName="UNIMOD" uri="http://www.unimod.org/obo/unimod.obo" id="UNIMOD"/>
    </CvList>
    <ChangeLog>
        <ChangeLogEntry date="2024-10-07">Updated project metadata.</ChangeLogEntry>
    </ChangeLog>
    <DatasetSummary announceDate="2024-10-07" hostingRepository="PRIDE" title="TMT spikes -  Using R and Bioconductor for proteomics data analysis">
        <Description>Expected reporter ion ratios: Erwinia peptides:    1:1:1:1:1:1 Enolase spike (sp|P00924|ENO1_YEAST):  10:5:2.5:1:2.5:10 BSA spike (sp|P02769|ALBU_BOVIN):  1:2.5:5:10:5:1 PhosB spike (sp|P00489|PYGM_RABIT):  2:2:2:2:1:1 Cytochrome C spike (sp|P62894|CYC_BOVIN): 1:1:1:1:1:2</Description>
        <ReviewLevel>
            <cvParam cvRef="MS" accession="MS:1002854" name="Peer-reviewed dataset"/>
        </ReviewLevel>
        <RepositorySupport>
            <cvParam cvRef="MS" accession="MS:1002856" name="Supported dataset by repository"/>
        </RepositorySupport>
    </DatasetSummary>
    <DatasetIdentifierList>
        <DatasetIdentifier>
            <cvParam cvRef="MS" accession="MS:1001919" name="ProteomeXchange accession number" value="PXD000001"/>
            <cvParam cvRef="MS" accession="MS:1001921" name="ProteomeXchange accession number version number" value="11"/>
        </DatasetIdentifier>
        <DatasetIdentifier>
            <cvParam cvRef="MS" accession="MS:1001922" name="Digital Object Identifier (DOI)" value="10.6019/PXD000001"/>
        </DatasetIdentifier>
    </DatasetIdentifierList>
    <DatasetOriginList>
        <DatasetOrigin>
            <cvParam cvRef="MS" accession="MS:1002868" name="Original data"/>
        </DatasetOrigin>
    </DatasetOriginList>
    <SpeciesList>
        <Species>
            <cvParam cvRef="MS" accession="MS:1001469" name="taxonomy: scientific name" value="Erwinia carotovora"/>
            <cvParam cvRef="MS" accession="MS:1001467" name="taxonomy: NCBI TaxID" value="554"/>
        </Species>
    </SpeciesList>
    <InstrumentList>
        <Instrument id="Instrument_1">
            <cvParam cvRef="MS" accession="MS:1001742" name="LTQ Orbitrap Velos"/>
        </Instrument>
    </InstrumentList>
    <ModificationList>
        <cvParam cvRef="MOD" accession="MOD:01720" name="TMT6plex-126 reporter+balance reagent acylated residue"/>
        <cvParam cvRef="MOD" accession="MOD:01153" name="methylthiolated residue"/>
        <cvParam cvRef="MOD" accession="MOD:00425" name="monohydroxylated residue"/>
    </ModificationList>
    <ContactList>
        <Contact id="project_submitter">
            <cvParam cvRef="MS" accession="MS:1000586" name="contact name" value="Laurent Gatto"/>
            <cvParam cvRef="MS" accession="MS:1000589" name="contact email" value="lg390@cam.ac.uk"/>
            <cvParam cvRef="MS" accession="MS:1000590" name="contact affiliation" value="Department of Biochemistry, University of Cambridge"/>
            <cvParam cvRef="MS" accession="MS:1002037" name="dataset submitter"/>
        </Contact>
        <Contact id="project_lab_head">
            <cvParam cvRef="MS" accession="MS:1002332" name="lab head"/>
            <cvParam cvRef="MS" accession="MS:1000586" name="contact name" value="Laurent Gatto"/>
            <cvParam cvRef="MS" accession="MS:1000589" name="contact email" value="lg390@cam.ac.uk"/>
            <cvParam cvRef="MS" accession="MS:1000590" name="contact affiliation" value="Department of Biochemistry, University of Cambridge"/>
        </Contact>
    </ContactList>
    <PublicationList>
        <Publication id="PMID23692960">
            <cvParam cvRef="MS" accession="MS:1000879" name="PubMed identifier" value="23692960"/>
            <cvParam cvRef="MS" accession="MS:1002866" name="Reference" value="Gatto L, Christoforou A. Using R and Bioconductor for proteomics data analysis. Biochim Biophys Acta. 2014 1844(1 pt a):42-51"/>
        </Publication>
        <Publication id="DOI-10_1016_j_bbapap_2013_04_032">
            <cvParam cvRef="MS" accession="MS:1001922" name="Digital Object Identifier (DOI)" value="10.1016/j.bbapap.2013.04.032"/>
        </Publication>
        <Publication id="DOI-10_6019_PXD000001">
            <cvParam cvRef="MS" accession="MS:1001922" name="Digital Object Identifier (DOI)" value="10.6019/PXD000001"/>
        </Publication>
    </PublicationList>
    <KeywordList>
        <cvParam cvRef="MS" accession="MS:1001925" name="submitter keyword" value="spikes,TMT,Eriwinia"/>
        <cvParam cvRef="MS" accession="MS:1002340" name="ProteomeXchange project tag" value="PRIME-XS Project"/>
    </KeywordList>
    <FullDatasetLinkList>
        <FullDatasetLink>
            <cvParam cvRef="MS" accession="MS:1002852" name="Dataset FTP location" value="ftp://ftp.pride.ebi.ac.uk/pride/data/archive/2012/03/PXD000001"/>
        </FullDatasetLink>
        <FullDatasetLink>
            <cvParam cvRef="MS" accession="MS:1001930" name="PRIDE project URI" value="http://www.ebi.ac.uk/pride/archive/projects/PXD000001"/>
        </FullDatasetLink>
    </FullDatasetLinkList>
    <DatasetFileList>
        <DatasetFile id="FILE_1" name="TMT_Erwinia_1uLSike_Top10HCD_isol2_45stepped_60min_01.mzXML">
            <cvParam cvRef="MS" accession="MS:1002850" name="Peak list file URI" value="ftp://ftp.pride.ebi.ac.uk/pride/data/archive/2012/03/PXD000001/TMT_Erwinia_1uLSike_Top10HCD_isol2_45stepped_60min_01.mzXML"/>
        </DatasetFile>
        <DatasetFile id="FILE_2" name="erwinia_carotovora.fasta">
            <cvParam cvRef="MS" accession="MS:1002851" name="Other type file URI" value="ftp://ftp.pride.ebi.ac.uk/pride/data/archive/2012/03/PXD000001/erwinia_carotovora.fasta"/>
        </DatasetFile>
        <DatasetFile id="FILE_3" name="TMT_Erwinia_1uLSike_Top10HCD_isol2_45stepped_60min_01.raw">
            <cvParam cvRef="MS" accession="MS:1002846" name="Associated raw file URI" value="ftp://ftp.pride.ebi.ac.uk/pride/data/archive/2012/03/PXD000001/TMT_Erwinia_1uLSike_Top10HCD_isol2_45stepped_60min_01.raw"/>
        </DatasetFile>
        <DatasetFile id="FILE_4" name="F063721.dat-mztab.txt">
            <cvParam cvRef="MS" accession="MS:1002851" name="Other type file URI" value="ftp://ftp.pride.ebi.ac.uk/pride/data/archive/2012/03/PXD000001/F063721.dat-mztab.txt"/>
        </DatasetFile>
        <DatasetFile id="FILE_5" name="PRIDE_Exp_Complete_Ac_22134.xml.gz">
            <cvParam cvRef="MS" accession="MS:1002848" name="Result file URI" value="ftp://ftp.pride.ebi.ac.uk/pride/data/archive/2012/03/PXD000001/PRIDE_Exp_Complete_Ac_22134.xml.gz"/>
        </DatasetFile>
        <DatasetFile id="FILE_6" name="F063721.dat">
            <cvParam cvRef="MS" accession="MS:1002849" name="Search engine output file URI" value="ftp://ftp.pride.ebi.ac.uk/pride/data/archive/2012/03/PXD000001/F063721.dat"/>
        </DatasetFile>
        <DatasetFile id="FILE_7" name="PRIDE_Exp_Complete_Ac_22134.pride.mztab.gz">
            <cvParam cvRef="MS" accession="MS:1002851" name="Other type file URI" value="ftp://ftp.pride.ebi.ac.uk/pride/data/archive/2012/03/PXD000001/PRIDE_Exp_Complete_Ac_22134.pride.mztab.gz"/>
        </DatasetFile>
        <DatasetFile id="FILE_8" name="PRIDE_Exp_Complete_Ac_22134.pride.mgf.gz">
            <cvParam cvRef="MS" accession="MS:1002850" name="Peak list file URI" value="ftp://ftp.pride.ebi.ac.uk/pride/data/archive/2012/03/PXD000001/PRIDE_Exp_Complete_Ac_22134.pride.mgf.gz"/>
        </DatasetFile>
    </DatasetFileList>
    <RepositoryRecordList>
        <RepositoryRecord name="TMT spikes -  Using R and Bioconductor for proteomics data analysis" label="PRIDE project" recordID="PXD000001" repositoryID="PRIDE" uri="http://www.ebi.ac.uk/pride/archive/projects/PXD000001"/>
    </RepositoryRecordList>
</ProteomeXchangeDataset>
`;

// use like this:
// async function main() {
//   // transform
//   const dataset = xmlToClass(xmlData, ProteomeXchangeDatasetType);
//   Logger.log(
//     dataset.DatasetIdentifierList.DatasetIdentifier[0].cvParam[0].value ===
//       'PXD000001'
//   );
//   // validate
//   const res = await validate(dataset);
//   Logger.log('errors:', res);
// }
//
// main();
