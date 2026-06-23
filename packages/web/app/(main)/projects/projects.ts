export interface ProjectOutputLink {
  label: string;
  href: string;
  description: string;
}

export interface FundedProject {
  slug: string;
  shortName?: string;
  title: string;
  lead: string;
  institution: string;
  grantRef: string;
  awardValue: string;
  period: string;
  theme: 'Mosquito-borne disease' | 'Tick-borne disease' | 'Genomics';
  focus: string[];
  summary: string;
  hubRelevance: string;
  awardUrl: string;
  outputsUrl: string;
  outputLinks: ProjectOutputLink[];
}

const gtrProjectUrl = (grantRef: string) =>
  `https://gtr.ukri.org/projects?ref=${encodeURIComponent(grantRef)}`;

const bbsrcAwardUrl = (grantRef: string) =>
  `https://gow.bbsrc.ukri.org/grants/AwardDetails.aspx?FundingReference=${encodeURIComponent(grantRef)}`;

export const fundedProjects: FundedProject[] = [
  {
    slug: 'culex-arbovirus-transmission',
    title:
      'Culex distribution, vector competence and threat of transmission of arboviruses to humans and animals in the UK',
    lead: 'Professor Matthew Baylis',
    institution: 'University of Liverpool',
    grantRef: 'BB/X018172/1',
    awardValue: 'GBP 984,395',
    period: 'April 2023 to March 2026',
    theme: 'Mosquito-borne disease',
    focus: ['Culex mosquitoes', 'West Nile virus', 'Usutu virus', 'Risk maps'],
    summary:
      'This project investigates the distribution, habitat use, host feeding preferences, and vector competence of native Culex mosquitoes for West Nile and Usutu viruses under current and future UK climate conditions.',
    hubRelevance:
      'The project is expected to produce vector occurrence, habitat, competence, and model output data that can strengthen national preparedness for mosquito-borne arboviruses.',
    awardUrl: bbsrcAwardUrl('BB/X018172/1'),
    outputsUrl: gtrProjectUrl('BB/X018172/1'),
    outputLinks: [
      {
        label: 'Hub data search',
        href: '/search?query=Culex%20West%20Nile%20Usutu',
        description: 'Find related datasets indexed by VBD Hub.'
      },
      {
        label: 'Gateway to Research',
        href: gtrProjectUrl('BB/X018172/1'),
        description: 'View publications and reported outcomes for this award.'
      }
    ]
  },
  {
    slug: 'reservoir-host-communities-tick-control',
    shortName: 'RodTickPathMan',
    title:
      'One Health approach to tick-borne disease control through manipulation of reservoir host communities at landscape scale',
    lead: 'Professor Steven Belmain',
    institution: 'University of Greenwich',
    grantRef: 'BB/X017982/1',
    awardValue: 'GBP 1,016,184',
    period: 'April 2023 to March 2026',
    theme: 'Tick-borne disease',
    focus: [
      'Ticks',
      'Reservoir hosts',
      'Landscape management',
      'Lyme disease ecology'
    ],
    summary:
      'This project examines whether managing reservoir host communities at landscape scale can reduce tick-borne disease risk through a One Health approach.',
    hubRelevance:
      'Outputs can help connect ecological field evidence, host community data, pathogen observations, and practical intervention evidence across human, animal, and environmental health.',
    awardUrl: bbsrcAwardUrl('BB/X017982/1'),
    outputsUrl: gtrProjectUrl('BB/X017982/1'),
    outputLinks: [
      {
        label: 'Hub data search',
        href: '/search?query=RodTickPathMan%20ticks',
        description: 'Find related tick and reservoir-host datasets.'
      },
      {
        label: 'Gateway to Research',
        href: gtrProjectUrl('BB/X017982/1'),
        description: 'View publications and reported outcomes for this award.'
      }
    ]
  },
  {
    slug: 'genes-vbd-network',
    shortName: 'GenES-VBD',
    title:
      'Genomic Epidemiology tools for the Surveillance of Vector Borne Diseases: applied to tick species, reservoirs, and pathogens',
    lead: 'Dr Susana Campino',
    institution: 'London School of Hygiene and Tropical Medicine',
    grantRef: 'BB/X018156/1',
    awardValue: 'GBP 690,694',
    period: 'April 2023 to March 2026',
    theme: 'Genomics',
    focus: ['Genomic epidemiology', 'Tick species', 'Reservoirs', 'Pathogens'],
    summary:
      'GenES-VBD develops genomic epidemiology resources for surveillance of vector-borne disease systems, with emphasis on ticks, reservoir species, and pathogens.',
    hubRelevance:
      'The project is closely aligned with Hub goals around reusable genomic resources, metadata, and cross-project data sharing for surveillance.',
    awardUrl: bbsrcAwardUrl('BB/X018156/1'),
    outputsUrl: gtrProjectUrl('BB/X018156/1'),
    outputLinks: [
      {
        label: 'Hub data search',
        href: '/search?query=GenES-VBD%20genomic%20epidemiology',
        description: 'Find related genomic surveillance records.'
      },
      {
        label: 'Gateway to Research',
        href: gtrProjectUrl('BB/X018156/1'),
        description: 'View publications and reported outcomes for this award.'
      }
    ]
  },
  {
    slug: 'scotland-mosquito-risk',
    title:
      'Assessing the risk of mosquito vector-borne diseases in Scotland and their response to environmental change',
    lead: 'Professor Heather Ferguson',
    institution: 'University of Glasgow',
    grantRef: 'BB/X018113/1',
    awardValue: 'GBP 1,003,927',
    period: 'April 2023 to March 2026',
    theme: 'Mosquito-borne disease',
    focus: [
      'Mosquito surveillance',
      'Scotland',
      'Avian reservoirs',
      'Environmental change'
    ],
    summary:
      'This project addresses surveillance gaps in Scotland by sampling mosquitoes and birds, testing for zoonotic pathogens, assessing vector competence, and modelling current and future risk.',
    hubRelevance:
      'The work can contribute mosquito occurrence, pathogen screening, competence, and risk-map outputs for an under-sampled part of the UK.',
    awardUrl: bbsrcAwardUrl('BB/X018113/1'),
    outputsUrl: gtrProjectUrl('BB/X018113/1'),
    outputLinks: [
      {
        label: 'Hub data search',
        href: '/search?query=Scotland%20mosquito%20vector-borne',
        description: 'Find Scottish mosquito and pathogen surveillance records.'
      },
      {
        label: 'Gateway to Research',
        href: gtrProjectUrl('BB/X018113/1'),
        description: 'View publications and reported outcomes for this award.'
      }
    ]
  },
  {
    slug: 'vector-borne-radar',
    shortName: 'Vector-borne RADAR',
    title: 'Vector-borne RADAR: Real-time Arbovirus Detection And Response',
    lead: 'Dr Arran Folly',
    institution: 'Animal and Plant Health Agency',
    grantRef: 'BB/X017990/1',
    awardValue: 'GBP 961,953',
    period: 'March 2023 to June 2026',
    theme: 'Mosquito-borne disease',
    focus: [
      'Wild birds',
      'Mosquitoes',
      'Usutu virus',
      'West Nile virus',
      'Early warning'
    ],
    summary:
      'Vector-borne RADAR enhances surveillance for mosquito-borne diseases of wild birds in the UK by combining bird sampling, mosquito trapping, laboratory screening, sequencing, and outbreak early-warning methods.',
    hubRelevance:
      'RADAR demonstrates the type of multi-partner surveillance workflow the Hub is designed to make more discoverable and reusable across public, veterinary, and wildlife health contexts.',
    awardUrl: bbsrcAwardUrl('BB/X017990/1'),
    outputsUrl: gtrProjectUrl('BB/X017990/1'),
    outputLinks: [
      {
        label: 'Project website',
        href: 'http://www.vb-radar.com',
        description: 'Read more about the RADAR project and its activities.'
      },
      {
        label: 'Hub data search',
        href: '/search?query=Vector-borne%20RADAR%20Usutu',
        description: 'Find related bird and mosquito surveillance records.'
      },
      {
        label: 'Gateway to Research',
        href: gtrProjectUrl('BB/X017990/1'),
        description:
          'View publications, policy influence, and engagement outputs.'
      }
    ]
  },
  {
    slug: 'zoonotic-mosquito-borne-viral-disease',
    title:
      'Understanding, forecasting, and mitigating zoonotic mosquito-borne viral disease in the UK',
    lead: 'Dr Grant Leslie Hughes',
    institution: 'Liverpool School of Tropical Medicine',
    grantRef: 'BB/X018024/1',
    awardValue: 'GBP 1,016,110',
    period: 'April 2023 to March 2026',
    theme: 'Mosquito-borne disease',
    focus: [
      'West Nile virus',
      'Usutu virus',
      'Transmission modelling',
      'Mitigation'
    ],
    summary:
      'This project studies the conditions that could permit onward transmission of zoonotic mosquito-borne viruses in the UK, integrating field studies, ornithological data, vector biology, and spatial transmission models.',
    hubRelevance:
      'The project brings together the types of vector, host, pathogen, and model data needed for integrated forecasting and mitigation workflows.',
    awardUrl: bbsrcAwardUrl('BB/X018024/1'),
    outputsUrl: gtrProjectUrl('BB/X018024/1'),
    outputLinks: [
      {
        label: 'Hub data search',
        href: '/search?query=zoonotic%20mosquito-borne%20viral%20disease',
        description: 'Find related mosquito-borne disease datasets.'
      },
      {
        label: 'Gateway to Research',
        href: gtrProjectUrl('BB/X018024/1'),
        description: 'View publications and reported outcomes for this award.'
      }
    ]
  },
  {
    slug: 'ticktools',
    shortName: 'TickTools',
    title:
      'TickTools: development of tools to monitor and control tick-borne diseases of humans and livestock',
    lead: 'Dr Nicolas Johnson',
    institution: 'Animal and Plant Health Agency',
    grantRef: 'BB/X018008/1',
    awardValue: 'GBP 1,048,010',
    period: 'March 2023 to December 2026',
    theme: 'Tick-borne disease',
    focus: [
      'Tick-borne encephalitis virus',
      'Louping ill virus',
      'Tick microbiome',
      'Serological tools'
    ],
    summary:
      'TickTools develops field, laboratory, genomic, and serological tools to improve monitoring and control of tick-borne flaviviruses affecting people and livestock.',
    hubRelevance:
      'The project has already reported sequence datasets and data-sharing engagement with the VBD Hub, making it a strong candidate for discoverable project-output pages.',
    awardUrl: bbsrcAwardUrl('BB/X018008/1'),
    outputsUrl: gtrProjectUrl('BB/X018008/1'),
    outputLinks: [
      {
        label: 'Hub data search',
        href: '/search?query=TickTools',
        description: 'Find related tick, pathogen, and sequence records.'
      },
      {
        label: 'Gateway to Research',
        href: gtrProjectUrl('BB/X018008/1'),
        description: 'View publications, data outputs, and collaborations.'
      }
    ]
  },
  {
    slug: 'optick',
    shortName: 'OpTick',
    title:
      'One Health surveillance and management of tick-borne disease threats in a changing environment',
    lead: 'Dr Bethan Purse and Dr Caroline Millins',
    institution:
      'UK Centre for Ecology and Hydrology and University of Liverpool',
    grantRef: 'BB/X017974/1',
    awardValue: 'GBP 1,015,878',
    period: 'April 2023 to March 2026',
    theme: 'Tick-borne disease',
    focus: [
      'Farm landscapes',
      'Livestock tick-borne disease',
      'Risk guidance',
      'Co-production'
    ],
    summary:
      'OpTick investigates how landscape change, farm management, climate, and host ecology affect tick-borne disease exposure for livestock and people on UK farms.',
    hubRelevance:
      'OpTick is expected to produce field evidence, risk guidance, stakeholder outputs, and modelling frameworks that fit the Hub mission of connecting data with policy-relevant use.',
    awardUrl: bbsrcAwardUrl('BB/X017974/1'),
    outputsUrl: gtrProjectUrl('BB/X017974/1'),
    outputLinks: [
      {
        label: 'Project website',
        href: 'https://www.optick.ceh.ac.uk/',
        description: 'Read about the OpTick project, partners, and approach.'
      },
      {
        label: 'Hub data search',
        href: '/search?query=OpTick',
        description: 'Find related tick-borne disease and landscape records.'
      },
      {
        label: 'Gateway to Research',
        href: gtrProjectUrl('BB/X017974/1'),
        description: 'View publications and reported outcomes for this award.'
      }
    ]
  }
];

export function getProject(slug: string) {
  return fundedProjects.find((project) => project.slug === slug);
}
