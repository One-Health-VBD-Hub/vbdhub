import Heading from '@/components/Heading';
import React from 'react';
import Link from 'next/link';
import Stack from '@/components/Stack';
import Anchor from '@/components/Anchor';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Management Plan - Vector-Borne Diseases Hub',
  description: 'Data management plan for the Vector-Borne Diseases Hub.',
  openGraph: {
    title: 'Data Management Plan - Vector-Borne Diseases Hub',
    description: 'Data management plan for the Vector-Borne Diseases Hub.'
  },
  alternates: {
    canonical: '/dmp'
  }
};

export default function DataManagementPlanPage() {
  return (
    <Stack as={'main'} gap={4} className='mx-auto mt-24 sm:mt-32'>
      <Heading id='dmp'>Data Management Plan (DMP)</Heading>

      <p>
        This page summarises how data will be collected, curated, stored,
        shared, and preserved for the Vector-Borne Diseases Hub.
      </p>

      <ul className='list-inside list-disc'>
        <li>
          <Anchor
            href='#project-name'
            target='_self'
            rel={undefined}
            className='text-[#0f62fe] hover:underline'
          >
            0. Project name
          </Anchor>
        </li>
        <li>
          <Anchor
            href='#description'
            target='_self'
            rel={undefined}
            className='text-[#0f62fe] hover:underline'
          >
            1. Description of the data
          </Anchor>
        </li>
        <li>
          <Anchor
            href='#management'
            target='_self'
            rel={undefined}
            className='text-[#0f62fe] hover:underline'
          >
            2. Data management, documentation, and curation
          </Anchor>
        </li>
        <li>
          <Anchor
            href='#sharing'
            target='_self'
            rel={undefined}
            className='text-[#0f62fe] hover:underline'
          >
            3. Data sharing and access
          </Anchor>
        </li>
        <li>
          <Anchor
            href='#security'
            target='_self'
            rel={undefined}
            className='text-[#0f62fe] hover:underline'
          >
            4. Data security
          </Anchor>
        </li>
        <li>
          <Anchor
            href='#capabilities'
            target='_self'
            rel={undefined}
            className='text-[#0f62fe] hover:underline'
          >
            5. Capabilities
          </Anchor>
        </li>
        <li>
          <Anchor
            href='#maintaining'
            target='_self'
            rel={undefined}
            className='text-[#0f62fe] hover:underline'
          >
            6. Maintaining and implementing the DMP
          </Anchor>
        </li>
        <li>
          <Anchor
            href='#environmental'
            target='_self'
            rel={undefined}
            className='text-[#0f62fe] hover:underline'
          >
            7. Environmental considerations
          </Anchor>
        </li>
        <li>
          <Anchor
            href='#responsibilities'
            target='_self'
            rel={undefined}
            className='text-[#0f62fe] hover:underline'
          >
            8. Responsibilities
          </Anchor>
        </li>
        <li>
          <Anchor
            href='#policies'
            target='_self'
            rel={undefined}
            className='text-[#0f62fe] hover:underline'
          >
            9. Relevant policies
          </Anchor>
        </li>
        <li>
          <Anchor
            href='#author'
            target='_self'
            rel={undefined}
            className='text-[#0f62fe] hover:underline'
          >
            10. Author of this DMP
          </Anchor>
        </li>
      </ul>

      <Stack gap={3}>
        <Heading id='project-name' as='h2'>
          0. Project name
        </Heading>

        <p className='font-medium'>One Health VBD Hub</p>
      </Stack>

      <Stack gap={3}>
        <Heading id='description' as='h2'>
          1. Description of the data
        </Heading>

        <Heading id='type-of-study' as='h3'>
          1.1. Type of study
        </Heading>

        <ul className='list-inside list-disc'>
          <li>Consolidating and curating external data.</li>
          <li>
            Integrating data into appropriate repositories and indexing for
            discovery.
          </li>
          <li>Developing AI tools to extract data from literature.</li>
          <li>
            Providing tools for analysis, modelling, and response support.
          </li>
        </ul>

        <Heading id='types-of-data' as='h3'>
          1.2. Types of data
        </Heading>

        <ul className='list-inside list-disc'>
          <li>Data on VBD systems.</li>
          <li>Omics: genomic, transcriptomic, metagenomic data.</li>
          <li>Trait: phenotypic and demographic traits.</li>
          <li>Abundance and occurrence: time-series and point records.</li>
          <li>Epidemiological: incidence, prevalence.</li>
          <li>Derived and synthetic data.</li>
          <li>Harmonised, integrated tables linking multiple data types.</li>
          <li>
            Summary products, distribution maps, time-series summaries, and
            dashboard-ready aggregates.
          </li>
          <li>
            AI-extracted datasets from text-mining of published literature.
          </li>
        </ul>

        <Heading id='origin-of-data' as='h3'>
          1.3. Origin of the data
        </Heading>

        <p>
          Data originates from primary data producers (UK-based research and
          surveillance programmes), international repositories with omics,
          trait, abundance, and biodiversity data, machine-assisted text mining
          of publications, and grey literature.
        </p>

        <Heading id='format-and-scale' as='h3'>
          1.4. Format and scale of the data
        </Heading>

        <p className='font-medium'>Preferred formats</p>

        <ul className='list-inside list-disc'>
          <li>
            <span className='font-medium'>Tabular:</span> CSV/TSV (or Parquet)
          </li>
          <li>
            <span className='font-medium'>Structured:</span> JSON
          </li>
          <li>
            <span className='font-medium'>Geospatial:</span> GeoJSON, GeoTIFF,
            CSV + WKT
          </li>
          <li>
            <span className='font-medium'>Environmental:</span> NetCDF, GeoTIFF,
            or tidy tabular
          </li>
          <li>
            <span className='font-medium'>Sequence:</span> Partner-defined
            (FASTA, BAM/CRAM, VCF)
          </li>
          <li>
            <span className='font-medium'>Documentation/Metadata:</span>{' '}
            Markdown, plain text, PDF, JSON
          </li>
          <li>
            <span className='font-medium'>Code:</span> Text-based source files
          </li>
        </ul>

        <p className='font-medium'>Scale</p>

        <p>
          Indexing and linking up to tens of millions of records held in partner
          repositories. Hub-hosted datasets are anticipated to reach the 100-500
          GB range, with most data ultimately deposited into long-term
          repositories. Derived summary products and environmental covariates
          add tens of GB but remain manageable.
        </p>
      </Stack>

      <Stack gap={3}>
        <Heading id='management' as='h2'>
          2. Data management, documentation, and curation
        </Heading>

        <Heading id='managing-curating' as='h3'>
          2.1. Managing, storing, and curating data
        </Heading>

        <ul className='list-inside list-disc'>
          <li>
            Secure, RAID-backed storage with snapshots. Code and scripts are in
            Git repositories. Raw data is kept in separate staging areas.
          </li>
          <li>
            Standard extract-transform-load pipelines convert data. AI-assisted
            extraction is human-supervised. Steps are scripted, logged, and
            re-executable for full traceability.
          </li>
          <li>
            Systems use ISO 27001-compatible cloud services (UK/EEA residency,
            encryption). Backups are weekly, in separate regions.
          </li>
          <li>
            Datasets are deposited in community repositories for preservation
            and DOIs.
          </li>
          <li>
            Access is controlled by role-based access control (RBAC): public,
            authenticated users, curators, and administrators.
          </li>
        </ul>

        <Heading id='metadata-standards' as='h3'>
          2.2. Metadata standards and data documentation
        </Heading>

        <p>
          Datasets will have both human-readable and machine-actionable
          metadata.
        </p>

        <ul className='list-inside list-disc'>
          <li>
            <span className='font-medium'>Dataset-level metadata:</span> Text
            summarising scope, purpose, and limitations; authors and contacts;
            methods; licences; version; and links to related publications.
          </li>
          <li>
            <span className='font-medium'>Machine-readable metadata:</span>{' '}
            Formats aligned with community standards, for example Darwin Core
            and VecDyn/VecTraits for occurrence and many abundance datasets, and
            EML for more complex ecological datasets.
          </li>
          <li>
            <span className='font-medium'>Variable-level documentation:</span>{' '}
            Data dictionaries describing each variable, clear indication of
            coordinate reference systems for spatial data, time zones for
            temporal data, and transformations.
          </li>
          <li>
            <span className='font-medium'>Provenance and versioning:</span>{' '}
            Unique IDs for datasets and for individual records or samples, links
            to source repositories, original DOIs, and publications. Metadata is
            retained even if underlying data is restricted or withdrawn.
          </li>
        </ul>

        <Heading id='preservation' as='h3'>
          2.3. Data preservation strategy and standards
        </Heading>

        <p>
          We aim to ensure that data remains usable and citable beyond the end
          of the award. Primary preservation for most data rests with domain
          repositories (for example, occurrence in GBIF). In case of the project
          ceasing, Hub-specific value-added artefacts will be archived in an
          institutional or generalist repository with DOIs and sufficient
          metadata to reconstruct integration. Code, containers, and workflows
          will be preserved via open Git repositories.
        </p>
      </Stack>

      <Stack gap={3}>
        <Heading id='sharing' as='h2'>
          3. Data sharing and access
        </Heading>

        <Heading id='where-shared' as='h3'>
          3.1. Where will data be shared?
        </Heading>

        <ul className='list-inside list-disc'>
          <li>
            <span className='font-medium'>VBD Hub platform:</span> Central
            discovery portal exposing metadata, search, filtering, and
            visualisation across data types. Programmatic access via API and
            R/Python packages.
          </li>
          <li>
            <span className='font-medium'>VBD Hub repository:</span> For data
            that cannot be uploaded to existing global repositories.
          </li>
          <li>
            <span className='font-medium'>Partner repositories:</span> VecTraits
            or VecDyn for trait and abundance data, GBIF for species occurrence
            and some abundance datasets, INSDC (GenBank/EMBL-EBI) and
            ProteomeXchange for omics.
          </li>
          <li>
            <span className='font-medium'>
              Generalist and institutional repositories:
            </span>{' '}
            Figshare, Zenodo, or institutional repositories for integrated or
            derived products, and AI-curated corpora. Institutional archives for
            snapshots of key Hub datasets and code.
          </li>
          <li>
            <span className='font-medium'>Software and training:</span> GitHub
            for packages and code. Global Vector Hub for publications (for
            example, SOPs and training) with cross-links from vbdhub.org.
          </li>
        </ul>

        <Heading id='when-available' as='h3'>
          3.2. When will data be available?
        </Heading>

        <ul className='list-inside list-disc'>
          <li>
            Data deposited before publication will be openly available at the
            time of article publication, with DOIs cited in manuscripts.
          </li>
          <li>
            Validated baseline curated datasets within 3 months of data
            collection or curation.
          </li>
          <li>
            All data will be shared according to agreed data sharing plans,
            including time-limited embargoes where necessary.
          </li>
        </ul>

        <p>
          For sensitive data, aggregated or anonymised summaries may be
          released, with restricted access potentially remaining indefinitely.
          All data, even restricted, will have registered and searchable
          metadata with clear access conditions and contact points.
        </p>

        <Heading id='findable-accessible' as='h3'>
          3.3. How will data be made findable and accessible?
        </Heading>

        <ul className='list-inside list-disc'>
          <li>Persistent identifiers (DOIs or PIDs, stable URLs).</li>
          <li>
            Rich, searchable metadata (structured, exposed via web interface,
            endpoints to support harvesting).
          </li>
          <li>
            Standardised access mechanisms (open web access to metadata,
            download, and documentation, APIs for programmatic access or
            bulk-download).
          </li>
          <li>
            Indexing and registries (key datasets and Hub resources in relevant
            catalogues).
          </li>
        </ul>

        <Heading id='reusable' as='h3'>
          3.4. How will data be made reusable?
        </Heading>

        <ul className='list-inside list-disc'>
          <li>
            <span className='font-medium'>Clear licensing:</span> Prefer CC BY
            4.0 licence for curated datasets and any software produced. Licence
            metadata embedded in dataset records.
          </li>
          <li>
            <span className='font-medium'>High-quality documentation:</span>{' '}
            Persistent links to methods, SOPs, and study protocols used to
            generate or curate datasets. Tutorials showing how to load, combine,
            and analyse Hub data.
          </li>
          <li>
            <span className='font-medium'>Provenance and quality flags:</span>{' '}
            Provenance recorded (source article or report, repository, pipeline)
            and quality flags indicating limitations.
          </li>
          <li>
            <span className='font-medium'>
              Standard formats and vocabularies:
            </span>{' '}
            Use of controlled vocabularies and ontologies, consistent encoding
            of dates, times, and locations.
          </li>
          <li>
            Users encouraged to cite both dataset DOI and key underlying
            publications, ensuring appropriate credit to data generators and
            curators.
          </li>
        </ul>

        <Heading id='restrictions' as='h3'>
          3.5. Restrictions or delays to sharing, with planned actions to limit
          such restrictions
        </Heading>

        <p className='font-medium'>Potential reasons for restriction</p>

        <ul className='list-inside list-disc'>
          <li>
            Privacy or confidentiality: individually, holding-, or
            community-identifiable data.
          </li>
          <li>Third-party rights or IP: data under licence or contract.</li>
          <li>Publication embargoes: time-limited restrictions.</li>
        </ul>

        <p className='font-medium'>Managing restrictions</p>

        <ul className='list-inside list-disc'>
          <li>Conduct data protection and risk assessments.</li>
          <li>
            Prioritise aggregation, anonymisation, and fuzzing over withholding.
          </li>
          <li>Use data use agreements for controlled data.</li>
          <li>Keep embargoes short and justified.</li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading id='security' as='h2'>
          4. Data security
        </Heading>

        <Heading id='security-standards' as='h3'>
          4.1. Formal information and data security standard
        </Heading>

        <ul className='list-inside list-disc'>
          <li>GDPR and DPA18.</li>
          <li>
            ISO 27001-aligned information security practices via institutional
            IT services and cloud providers (for example ISO 27001/27017/27018
            certification, SOC-type reports).
          </li>
          <li>
            Institutional frameworks for information security, including Cyber
            Essentials.
          </li>
        </ul>

        <Heading id='security-risks' as='h3'>
          4.2. Main risks to data security
        </Heading>

        <ul className='list-inside list-disc'>
          <li>
            <span className='font-medium'>Unauthorised access (Low):</span>{' '}
            Role-based access (least privilege); mandatory institutional login
            and MFA for admins; regular access reviews; logging; incident
            response with rapid access revocation and DPO intervention.
          </li>
          <li>
            <span className='font-medium'>
              Accidental loss or deletion (Low to moderate):
            </span>{' '}
            Automated backups with recovery, version control, restricted delete
            permissions; incident response includes backup restoration,
            documenting cause, and updating permissions or workflows.
          </li>
          <li>
            <span className='font-medium'>
              Data interception in transit (Very Low):
            </span>{' '}
            HTTPS/TLS, secure transfer, and modern ciphers; incident response
            includes revoking credentials, reviewing logs, and notifying parties
            as required.
          </li>
          <li>
            <span className='font-medium'>
              Misuse or secondary use beyond consent (Low to moderate):
            </span>{' '}
            Data use policies, click-through terms, and controlled-access data
            use agreements. Anonymise or aggregate sensitive data; incident
            response includes suspending access, investigating, and notifying
            governance or DPO.
          </li>
          <li>
            <span className='font-medium'>
              Integrity compromise or corruption (Low):
            </span>{' '}
            Write-once or versioned storage. Controlled, peer-reviewed curation
            pipelines with audit trails; incident response includes version
            rollback, documentation, pipeline patching, and user notification.
          </li>
          <li>
            <span className='font-medium'>
              Service disruption (availability) (High):
            </span>{' '}
            Highly available cloud; monitoring, alerting, rate limiting, and
            WAF; incident response includes documenting maintenance windows and
            following IT incident procedures.
          </li>
          <li>
            <span className='font-medium'>
              Legal or policy non-compliance (Very Low):
            </span>{' '}
            Consult DPOs and RDM; document DPIAs; restrict use; review
            compliance; incident response includes immediate review with
            legal/DPO and technical fixes.
          </li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading id='capabilities' as='h2'>
          5. Capabilities
        </Heading>

        <ul className='list-inside list-disc'>
          <li>
            Institutional infrastructure: secure storage and backup at ICL.
          </li>
          <li>Research computing support.</li>
          <li>Existing dedicated project staff.</li>
          <li>Experienced PIs and Co-Is.</li>
          <li>
            Track record in building and operating community data
            infrastructures.
          </li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading id='maintaining' as='h2'>
          6. Maintaining and implementing the Data Management Plan
        </Heading>

        <p>
          The DMP will be formally reviewed at least annually, and additionally
          following:
        </p>

        <ul className='list-inside list-disc'>
          <li>Major project milestones.</li>
          <li>Significant incidents or near-misses.</li>
          <li>Changes in external requirements.</li>
        </ul>

        <p>
          Feedback will be explicitly considered in revisions, especially
          concerning data discoverability, access procedures, or community
          standards.
        </p>
      </Stack>

      <Stack gap={3}>
        <Heading id='environmental' as='h2'>
          7. Environmental considerations
        </Heading>

        <ul className='list-inside list-disc'>
          <li>
            Use virtualised or cloud resources instead of under-utilised local
            servers.
          </li>
          <li>
            Avoid unnecessary duplication: where possible, rely on links to
            existing repositories rather than storing complete copies.
          </li>
          <li>Use tiered storage and lifecycle policies.</li>
          <li>
            Design AI and ETL pipelines that are incremental and scalable,
            avoiding reprocessing.
          </li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading id='responsibilities' as='h2'>
          8. Responsibilities
        </Heading>

        <ul className='list-inside list-disc'>
          <li>
            <span className='font-medium'>
              Overall data management and DMP ownership:
            </span>{' '}
            Principal Investigator (PI), oversight by Project Management Board
            and institutional RDM teams.
          </li>
          <li>
            <span className='font-medium'>
              Day-to-day data management and curation:
            </span>{' '}
            Data Curator, supported by PI, Co-Is, and Advisory Group.
          </li>
          <li>
            <span className='font-medium'>
              Metadata standards and documentation:
            </span>{' '}
            Data Curator and PDRA or Software Developer, supported by Co-Is with
            repository experience.
          </li>
          <li>
            <span className='font-medium'>
              Platform and infrastructure security:
            </span>{' '}
            Software Developer, supported by institutional IT and information
            security teams.
          </li>
          <li>
            <span className='font-medium'>Quality assurance of data:</span> Data
            Curator and PDRA, supported by PI and relevant Co-Is (for example,
            domain experts).
          </li>
          <li>
            <span className='font-medium'>
              Ethical and legal compliance (data):
            </span>{' '}
            PI and Data Curator, supported by the Institutional Data Protection
            Officer and partners.
          </li>
          <li>
            <span className='font-medium'>DMP review and reporting:</span> Data
            Curator or Software Developer, supported by Management Board and
            Advisory Group.
          </li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading id='policies' as='h2'>
          9. Relevant institutional, departmental, or study policies on data
          sharing and data security
        </Heading>

        <ul className='list-inside list-disc'>
          <li>
            <Anchor
              href='https://www.imperial.ac.uk/media/imperial-college/research-and-innovation/research-office/public/Imperial-College-RDM-Policy.pdf'
            >
              Data Management and Procedures
            </Anchor>
          </li>
          <li>
            <Anchor
              href='https://www.imperial.ac.uk/media/imperial-college/administration-and-support-services/secretariat/public/college-governance/charters-statutes-ordinances-regulations/policies-regulations-codes-of-practice/information-systems-security/Information-Security-Policy-v7.0.pdf'
            >
              Data Security
            </Anchor>
          </li>
          <li>
            <Anchor
              href='https://www.imperial.ac.uk/research-and-innovation/support-for-staff/scholarly-communication/research-data-management/sharing-data/'
            >
              Data Sharing
            </Anchor>
          </li>
          <li>
            <Anchor
              href='https://www.imperial.ac.uk/media/imperial-college/administration-and-support-services/secretariat/public/information-governance/Information-Governance-Policy-Framework---to-be-reviewed.pdf'
            >
              Institutional Information Governance
            </Anchor>
          </li>
          <li>
            <Anchor
              href='https://vbdhub.org/privacy'
            >
              GDPR and privacy information
            </Anchor>
          </li>
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading id='author' as='h2'>
          10. Author of this Data Management Plan
        </Heading>

        <p>
          Stanislav Modrak (
          <Link
            href='mailto:s.modrak@imperial.ac.uk'
            className='text-[#0f62fe] hover:underline'
          >
            s.modrak@imperial.ac.uk
          </Link>
          )
        </p>
      </Stack>
    </Stack>
  );
}
