import { Fragment, type ReactNode } from 'react';

interface FundedProject {
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
  teamMembers: { name: string; role: string }[];
  organisations: string[];
  question?: string;
  summary: string;
  description: ReactNode[];
  hubRelevance: string;
  searchQuery: string;
  website?: string;
  projectLinks?: { label: string; href: string }[];
  dataOutputs?: string[];
  images?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption: string;
  }[];
}

export const gtrProjectUrl = (grantRef: string) =>
  `https://gtr.ukri.org/projects?ref=${encodeURIComponent(grantRef)}`;

export const bbsrcAwardUrl = (grantRef: string) =>
  `https://gow.bbsrc.ukri.org/grants/AwardDetails.aspx?FundingReference=${encodeURIComponent(grantRef)}`;

export const hubSearchUrl = (query: string) => `/search?query=${encodeURIComponent(query)}`;

export const fundedProjects: FundedProject[] = [
  {
    slug: 'culex-arbovirus-transmission',
    title:
      'Culex distribution, vector competence and threat of transmission of arboviruses to humans and animals in the UK',
    lead: 'Professor Matthew Baylis',
    institution: 'University of Liverpool',
    teamMembers: [
      { name: 'Matthew Baylis', role: 'Principal Investigator' },
      { name: 'Lisa Reimer', role: 'Co-Investigator' },
      { name: 'Jolyon Medlock', role: 'Co-Investigator' },
      { name: 'Jennifer Lord', role: 'Co-Investigator' },
      { name: 'Luigi Sedda', role: 'Co-Investigator' },
      { name: 'Marcus Blagrove', role: 'Co-Investigator' }
    ],
    organisations: [
      'University of Liverpool',
      'Liverpool School of Tropical Medicine',
      'UK Health Security Agency',
      'Lancaster University'
    ],
    grantRef: 'BB/X018172/1',
    awardValue: '£984,395',
    period: 'April 2023 to March 2026',
    theme: 'Mosquito-borne disease',
    focus: ['Culex mosquitoes', 'West Nile virus', 'Usutu virus', 'Risk maps'],
    summary:
      'This project investigates the distribution, habitat use, host feeding preferences, and vector competence of native Culex mosquitoes for West Nile and Usutu viruses under current and future UK climate conditions.',
    description: [
      <Fragment key='culex-risk'>
        This project assesses the risk from the UK <i>Culex pipiens</i> complex and related{' '}
        <i>Culex torrentium</i> mosquitoes for transmission of West Nile virus and Usutu virus.
      </Fragment>,
      'The team is collecting geographic, larval habitat, host-feeding, and vector competence data to build UK transmission models under typical summer, heatwave, and future climate conditions.'
    ],
    hubRelevance:
      'The project is expected to produce vector occurrence, habitat, competence, and model output data that can strengthen national preparedness for mosquito-borne arboviruses.',
    searchQuery: 'Culex West Nile Usutu'
  },
  {
    slug: 'reservoir-host-communities-tick-control',
    shortName: 'RodTickPathMan',
    title:
      'One Health approach to tick-borne disease control through manipulation of reservoir host communities at landscape scale',
    lead: 'Professor Steven Belmain',
    institution: 'University of Greenwich',
    teamMembers: [
      { name: 'Steven Belmain', role: 'Principal Investigator' },
      { name: 'Harry Marshall', role: 'Co-Investigator' },
      { name: 'Daniel Bray', role: 'Co-Investigator' },
      { name: 'Simon Croft', role: 'Co-Investigator' },
      { name: 'Richard Birtles', role: 'Co-Investigator' },
      { name: 'Giovanna Massei', role: 'Co-Investigator' },
      { name: 'Holly Broadhurst', role: 'Postdoctoral Research Fellow' },
      { name: 'Katherine August', role: 'Postdoctoral Research Fellow' },
      { name: 'Georgy Abashin', role: 'Research Assistant' },
      { name: 'Rachel Orchard', role: 'Social Scientist' },
      { name: 'Greg Counsell', role: 'Social Scientist' },
      { name: 'Samantha Beaudoin', role: 'PhD Researcher' }
    ],
    organisations: [
      'University of Greenwich',
      'Animal and Plant Health Agency',
      'Forest Research',
      'University of York',
      'University of Salford'
    ],
    grantRef: 'BB/X017982/1',
    awardValue: '£1,054,183',
    period: 'March 2023 to March 2026',
    theme: 'Tick-borne disease',
    focus: ['Ticks', 'Reservoir hosts', 'Landscape management', 'Lyme disease ecology'],
    question: 'How does invasive wildlife contribute to the spread of ticks and Lyme disease?',
    summary:
      'Researchers investigated how grey squirrels contribute to Lyme disease risk and how different grey squirrel management strategies may influence this relationship.',
    description: [
      <Fragment key='rodtickpathman-context'>
        Current UK reforestation policies aim to mitigate climate change while increasing habitat
        availability and connectivity for native wildlife. However, greater connectivity may also
        facilitate the spread of invasive species such as grey squirrels and disease vectors
        including the tick <i>Ixodes ricinus</i>, which transmits <i>Borrelia burgdorferi</i>, the
        bacterium responsible for Lyme disease. Researchers from the University of Greenwich,
        University of Salford, York University, APHA, and Forest Research investigated how grey
        squirrels contribute to Lyme disease risk and how different grey squirrel management
        strategies may influence this relationship.
      </Fragment>,
      'The study was conducted across woodland sites in Cumbria, UK, where three grey squirrel management treatments were applied: culling, no culling, and simulated fertility-treatment culling. Vertebrate host populations were monitored using camera traps and acoustic recorders, while ticks were sampled over an 18-month period. Using a novel molecular blood-meal analysis method developed by the research team, researchers were able to identify which host species ticks had previously fed upon.',
      'Preliminary results showed that, prior to treatment, approximately 10% of ticks tested had fed on grey squirrels, making them the second most important host species detected after deer. Despite this, there was no evidence that controlling grey squirrel populations significantly affected tick densities across the sites, likely due to the presence of numerous alternative hosts.',
      <Fragment key='rodtickpathman-host-assays'>
        Additional assays are currently being developed to identify a wider range of host species,
        with particular focus on birds and pheasants, which are common in the study sites and are
        known to contribute to the spread of ticks and <i>Borrelia</i>. Ongoing work will assess
        whether the relative proportions of ticks feeding on different host species change following
        grey squirrel removal.
      </Fragment>,
      'Further research by the team demonstrated that ticks can detect m-cresol, a compound commonly found in grey squirrel urine. Behavioural assays showed that ticks are attracted to this chemical, suggesting that host odours may play a role in host detection. Future work will test additional chemical compounds extracted from grey squirrel odours as well as pheromones released by ticks.',
      'The project also explored stakeholder knowledge and perceptions of tick-borne diseases through interviews with land managers, medical professionals, and recreational users. While most participants reported moderate to high awareness of ticks and tick-borne diseases, this did not necessarily correspond with a high perception of personal risk. Many respondents felt that responsibility for managing tick risk should primarily lie with individuals accessing environments where ticks are present.',
      'Together, these findings will contribute to a predictive risk model to better understand how climate change and land management practices influence Lyme disease risk, helping landowners and policymakers make informed decisions that balance wildlife conservation with the protection of public health.'
    ],
    hubRelevance:
      'Outputs can help connect ecological field evidence, host community data, pathogen observations, and practical intervention evidence across human, animal, and environmental health.',
    searchQuery: 'RodTickPathMan ticks',
    dataOutputs: [
      'Quantitative data on tick responses to host odours and naturally-derived repellents - VecTraits.',
      'Qualitative data on proportions of ticks which have fed on squirrels and other hosts, and changes to tick abundance and tick-borne pathogen prevalence following squirrel control - VecTraits and VecDyn.'
    ],
    images: [
      {
        src: '/assets/project-pages/lab work collecting ticks from squirrels.jpg',
        alt: 'Researcher collecting ticks from a grey squirrel in the field',
        width: 4032,
        height: 3024,
        caption: 'Collecting ticks from grey squirrels'
      },
      {
        src: '/assets/project-pages/setting up camera traps 1.jpg',
        alt: 'Researcher setting up a camera trap in woodland',
        width: 2048,
        height: 1873,
        caption: 'Setting up camera traps in woodland study sites'
      },
      {
        src: '/assets/project-pages/ethovision tracking tick behaviour bioassays.jpg',
        alt: 'Tick behaviour bioassay plates being tracked with EthoVision software',
        width: 1500,
        height: 2000,
        caption: 'Tracking tick behaviour bioassays'
      },
      {
        src: '/assets/project-pages/tick stored in lab.jpg',
        alt: 'Tick stored in a laboratory sample tube',
        width: 1600,
        height: 1600,
        caption: 'Tick sample stored in the laboratory'
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
    teamMembers: [
      { name: 'Susana Campino', role: 'Principal Investigator' },
      { name: 'Kayleigh Hansford', role: 'Co-Investigator' },
      { name: 'Steven Pullan', role: 'Co-Investigator' },
      { name: 'Jolyon Medlock', role: 'Co-Investigator' },
      { name: 'Mojca Kristan', role: 'Co-Investigator' },
      { name: 'Taane Clark', role: 'Co-Investigator' }
    ],
    organisations: ['London School of Hygiene and Tropical Medicine', 'UK Health Security Agency'],
    grantRef: 'BB/X018156/1',
    awardValue: '£728,693',
    period: 'March 2023 to December 2026',
    theme: 'Genomics',
    focus: ['Genomic epidemiology', 'Tick species', 'Reservoirs', 'Pathogens'],
    summary:
      'GenES-VBD develops genomic epidemiology resources for surveillance of vector-borne disease systems, with emphasis on ticks, reservoir species, and pathogens.',
    description: [
      'GenES-VBD is developing genomic tools to improve surveillance of UK ticks and the pathogens they carry.',
      'The project focuses on genetic barcodes, amplicon sequencing, geospatial and phylogenomic analysis, and bioinformatics capacity for stakeholders involved in tick-borne disease surveillance.'
    ],
    hubRelevance:
      'The project is closely aligned with Hub goals around reusable genomic resources, metadata, and cross-project data sharing for surveillance.',
    searchQuery: 'GenES-VBD genomic epidemiology'
  },
  {
    slug: 'scotland-mosquito-risk',
    shortName: 'Mosquito Scotland',
    title:
      'Assessing the risk of mosquito vector-borne diseases in Scotland and their response to environmental change',
    lead: 'Professor Heather Ferguson',
    institution: 'University of Glasgow',
    teamMembers: [
      { name: 'Heather Ferguson', role: 'Principal Investigator' },
      { name: 'Jolyon Medlock', role: 'Co-Investigator' },
      { name: 'Juan Morales', role: 'Co-Investigator' },
      { name: 'Emilie Pondeville', role: 'Co-Investigator' },
      { name: 'Davide Dominoni', role: 'Co-Investigator' },
      { name: 'Steven White', role: 'Co-Investigator' },
      { name: 'Georgia Kirby', role: 'Research Co-Investigator' },
      { name: 'Luca Nelli', role: 'Research Co-Investigator' },
      { name: 'Francesco Baldini', role: 'Collaborator' }
    ],
    organisations: [
      'University of Glasgow',
      'UK Health Security Agency',
      'UK Centre for Ecology & Hydrology'
    ],
    grantRef: 'BB/X018113/1',
    awardValue: '£1,003,927',
    period: 'April 2023 to March 2026',
    theme: 'Mosquito-borne disease',
    focus: ['Mosquito surveillance', 'Scotland', 'Avian reservoirs', 'Environmental change'],
    question: 'How will mosquito-borne disease risk respond to environmental change?',
    summary:
      'Mosquito Scotland set out to understand interactions between mosquito and bird populations in Scotland, and how environmental change may affect mosquito-borne disease risk.',
    description: [
      'Climate and other environmental changes are driving the expansion of mosquito vector-borne diseases into areas previously unsuitable for transmission. This is particularly true of mosquito-transmitted viruses that can normally circulate in bird populations and can spill over into humans. These include infections like West Nile virus and Usutu virus, which have been detected in the UK in recent years. The ability to detect and respond to emergence in the UK is constrained by major gaps in national surveillance, with current activities restricted almost entirely to England and Wales.',
      'The Mosquito Scotland project set out to understand the interactions between mosquito and bird populations of Scotland. The project collected mosquitoes over two years in geographically and ecologically representative habitats across Scotland. Back in the laboratory, the team identified the host species field-collected mosquitoes had fed on, including humans, and whether they were infected with any viruses of public health or conservation concern.',
      <Fragment key='mosquito-scotland-culex'>
        The team also assessed the important mosquito vector <i>Culex pipiens</i> from Scotland for
        its ability to transmit viruses under controlled laboratory conditions.
      </Fragment>,
      'The project has found widespread distribution of mosquitoes across Scotland, with at least 16 species detected. Mosquitoes were able to live at surprisingly northern latitudes, including a mosquito reported in Shetland. In addition to their research activities, the team has been involved in responding to reports of nuisance biting around Scotland and helping Edinburgh Zoo investigate a suspected avian malaria outbreak in penguins.',
      'The results will support policy development by providing public and animal health authorities in the Scottish and UK governments with data on the presence of potential vector species and pathogens in avian reservoirs in Scotland.',
      'The project has established a citizen science platform which has already received more than 1,000 mosquito reports from across Scotland. This tool has facilitated identification of local hotspots for biting nuisance and could be used to guide targeted surveillance or control activities.'
    ],
    hubRelevance:
      'The work can contribute mosquito occurrence, pathogen screening, competence, and risk-map outputs for an under-sampled part of the UK.',
    searchQuery: 'Scotland mosquito vector-borne',
    website: 'https://www.mosquito-scotland.com/',
    projectLinks: [
      {
        label: 'Citizen science submission form',
        href: 'https://www.mosquito-scotland.com/submission-form'
      }
    ],
    dataOutputs: [
      'Entomological surveillance from nature reserves - VecDyn.',
      'Mosquito citizen science data - iNaturalist.',
      'Lab mosquito fitness data - VecTraits.',
      'Pathogen data in mosquitoes and birds - VecDyn can host mosquito data; Hub can host bird data.'
    ],
    images: [
      {
        src: '/assets/project-pages/IMG-20240512-WA0001.webp',
        alt: 'Researcher setting up a mosquito trap in an enclosure',
        width: 300,
        height: 400,
        caption: 'Setting up a mosquito trap'
      },
      {
        src: '/assets/project-pages/IMG-20240611-WA0028.webp',
        alt: 'Researcher hanging a mosquito trap from a tree',
        width: 300,
        height: 400,
        caption: 'Installing mosquito trapping equipment'
      },
      {
        src: '/assets/project-pages/IMG_20230719_143620.webp',
        alt: 'Researcher surveying tall wetland vegetation',
        width: 500,
        height: 464,
        caption: 'Surveying wetland habitat'
      },
      {
        src: '/assets/project-pages/IMG_20230920_110510.webp',
        alt: 'Researcher collecting field data beside wetland water',
        width: 500,
        height: 454,
        caption: 'Collecting field data in wetland habitat'
      },
      {
        src: '/assets/project-pages/IMG_20231002_152052418.webp',
        alt: 'Researcher standing in a flooded grassland survey site',
        width: 500,
        height: 438,
        caption: 'Surveying flooded grassland habitat'
      },
      {
        src: '/assets/project-pages/IMG_20240611_152116478.webp',
        alt: 'Researcher sampling near shallow wetland water',
        width: 300,
        height: 400,
        caption: 'Sampling shallow wetland habitat'
      }
    ]
  },
  {
    slug: 'vector-borne-radar',
    shortName: 'Vector-borne RADAR',
    title: 'Vector-borne RADAR: Real-time Arbovirus Detection And Response',
    lead: 'Dr Arran Folly',
    institution: 'Animal and Plant Health Agency',
    teamMembers: [
      { name: 'Arran Folly', role: 'Principal Investigator' },
      { name: 'Rob Robinson', role: 'Co-Investigator' },
      { name: 'Jolyon Medlock', role: 'Co-Investigator' },
      { name: 'Becki Lawson', role: 'Co-Investigator' }
    ],
    organisations: [
      'Animal and Plant Health Agency',
      'British Trust for Ornithology',
      'UK Health Security Agency',
      'Zoological Society of London'
    ],
    grantRef: 'BB/X017990/1',
    awardValue: '£961,953',
    period: 'March 2023 to June 2026',
    theme: 'Mosquito-borne disease',
    focus: ['Wild birds', 'Mosquitoes', 'Usutu virus', 'West Nile virus', 'Early warning'],
    summary:
      'Vector-borne RADAR enhances surveillance for mosquito-borne diseases of wild birds in the UK by combining bird sampling, mosquito trapping, laboratory screening, sequencing, and outbreak early-warning methods.',
    description: [
      'Vector-borne RADAR enhances surveillance for mosquito-borne diseases of wild birds in the UK, including viruses of medical and veterinary importance.',
      'The project combines bird sampling, mosquito trapping, laboratory screening, sequencing, citizen-science data, and early-warning methods to detect and understand emerging arbovirus risks.'
    ],
    hubRelevance:
      'RADAR outputs can help make multi-partner surveillance data easier to find and reuse across public, veterinary, and wildlife health contexts.',
    searchQuery: 'Vector-borne RADAR Usutu',
    website: 'http://www.vb-radar.com'
  },
  {
    slug: 'zoonotic-mosquito-borne-viral-disease',
    title:
      'Understanding, forecasting, and mitigating zoonotic mosquito-borne viral disease in the UK',
    lead: 'Dr Grant Leslie Hughes',
    institution: 'Liverpool School of Tropical Medicine',
    teamMembers: [
      { name: 'Grant Leslie Hughes', role: 'Principal Investigator' },
      { name: 'Jennifer Lord', role: 'Co-Investigator' },
      { name: 'Luke Mason', role: 'Co-Investigator' },
      { name: 'Christopher Jones', role: 'Co-Investigator' },
      { name: 'Jason Chapman', role: 'Co-Investigator' },
      {
        name: 'Joshua Longbottom',
        role: 'Researcher Co-Investigator'
      },
      {
        name: 'Aitor Casas-Sanchez',
        role: 'Researcher Co-Investigator'
      }
    ],
    organisations: [
      'Liverpool School of Tropical Medicine',
      'Science and Technology Facilities Council',
      'University of Exeter'
    ],
    grantRef: 'BB/X018024/1',
    awardValue: '£1,016,110',
    period: 'April 2023 to March 2026',
    theme: 'Mosquito-borne disease',
    focus: ['West Nile virus', 'Usutu virus', 'Transmission modelling', 'Mitigation'],
    summary:
      'This project studies the conditions that could permit onward transmission of zoonotic mosquito-borne viruses in the UK, integrating field studies, ornithological data, vector biology, and spatial transmission models.',
    description: [
      'This project studies the conditions that could permit onward transmission of zoonotic mosquito-borne viruses in the UK.',
      'The work brings together field studies, bird and mosquito data, vector biology, and spatial transmission models to support forecasting and mitigation of West Nile virus and Usutu virus risks.'
    ],
    hubRelevance:
      'The project brings together the types of vector, host, pathogen, and model data needed for integrated forecasting and mitigation workflows.',
    searchQuery: 'zoonotic mosquito-borne viral disease'
  },
  {
    slug: 'ticktools',
    shortName: 'TickTools',
    title:
      'TickTools: development of tools to monitor and control tick-borne diseases of humans and livestock',
    lead: 'Dr Nicholas Johnson',
    institution: 'Animal and Plant Health Agency',
    teamMembers: [
      { name: 'Nicholas Johnson', role: 'Principal Investigator' },
      { name: 'Janet Daly', role: 'Co-Investigator' },
      { name: 'Kevin Gough', role: 'Co-Investigator' },
      { name: 'Adam Blanchard', role: 'Co-Investigator' },
      { name: 'Alain Kohl', role: 'Co-Investigator' },
      { name: 'Benjamin Brennan', role: 'Co-Investigator' }
    ],
    organisations: [
      'Animal and Plant Health Agency',
      'University of Nottingham',
      'Liverpool School of Tropical Medicine',
      'University of Glasgow'
    ],
    grantRef: 'BB/X018008/1',
    awardValue: '£1,048,010',
    period: 'March 2023 to December 2026',
    theme: 'Tick-borne disease',
    focus: [
      'Tick-borne encephalitis virus',
      'Louping ill virus',
      'Tick microbiome',
      'Serological tools'
    ],
    question:
      'What can the tick microbiome tell us about the dispersal, potential spread, and control of zoonotic viruses?',
    summary:
      'TickTools has characterised the tick microbiome and interactome to support the UK response to tick-borne encephalitis virus, louping ill virus, and newly detected viral threats.',
    description: [
      'The UK is threatened by both recently emerged tick-borne encephalitis virus (TBEV) and the endemic pathogen of sheep, louping ill virus (LIV). Researchers from the Animal and Plant Health Agency, University of Nottingham, Liverpool School of Tropical Medicine, and the University of Glasgow have teamed up to collect data to support the UK response to these threats.',
      'The TickTools project has characterised the microbiome and interactome, all of the molecular interactions of the microbiome including those with pathogenic viruses and bacteria that cause disease, of ticks from across the UK.',
      'Their work has revealed an impressive diversity of UK tick microbiomes, with particular focus on viruses. The project has discovered two novel zoonotic viruses, Chimay rhabdovirus and Alongshan virus, in British ticks.',
      'These important findings have already contributed to policy by highlighting the importance of surveillance for these new viral threats. In the near future, the sequence data generated by TickTools can be used to develop a deeper understanding of tick populations in the UK, the pathogens they carry, and how we can prevent, diagnose, and treat them.'
    ],
    hubRelevance:
      'The project has already reported sequence datasets and data-sharing engagement with VBD Hub. These outputs are a good fit for indexing through VBD Hub.',
    searchQuery: 'TickTools',
    website:
      'https://aphascience.blog.gov.uk/2025/07/06/investigating-british-ticks-for-viral-threat/',
    projectLinks: [
      {
        label: 'Tick microbiome paper',
        href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11054956/pdf/viruses-16-00504.pdf'
      },
      {
        label: 'NCBI GenBank',
        href: 'https://www.ncbi.nlm.nih.gov/genbank/'
      },
      {
        label: 'University of Nottingham data repository',
        href: 'https://rdmc.nottingham.ac.uk/handle/internal/10055'
      }
    ],
    dataOutputs: [
      'Sequence data - all sequences generated by TickTools are submitted to NCBI GenBank within the nucleotide and SRA databases.',
      'Phage display data is posted on the University of Nottingham data website.',
      'Distribution and abundance of the sheep tick Ixodes ricinus sampled during the project will be shared with VBD Hub.'
    ]
  },
  {
    slug: 'optick',
    shortName: 'OpTick',
    title:
      'One Health surveillance and management of tick-borne disease threats in a changing environment',
    lead: 'Dr Bethan Purse',
    institution: 'UK Centre for Ecology & Hydrology',
    teamMembers: [
      { name: 'Bethan Purse', role: 'Principal Investigator' },
      { name: 'Caroline Louise Millins', role: 'Co-Investigator' },
      { name: 'Jolyon Medlock', role: 'Co-Investigator' },
      { name: 'Nicholas Johnson', role: 'Co-Investigator' },
      { name: 'Festus Asaaga', role: 'Co-Investigator' },
      { name: 'Jonathan Rushton', role: 'Co-Investigator' },
      {
        name: 'Kayleigh Hansford',
        role: 'Researcher Co-Investigator'
      },
      {
        name: 'Maya Holding',
        role: 'Researcher Co-Investigator'
      },
      {
        name: 'Richard Hassall',
        role: 'Researcher Co-Investigator'
      }
    ],
    organisations: [
      'UK Centre for Ecology & Hydrology',
      'University of Liverpool',
      'UK Health Security Agency',
      'Animal and Plant Health Agency',
      'Moredun Research Institute'
    ],
    grantRef: 'BB/X017974/1',
    awardValue: '£1,053,877',
    period: 'March 2023 to December 2026',
    theme: 'Tick-borne disease',
    focus: ['Farm landscapes', 'Livestock tick-borne disease', 'Risk guidance', 'Co-production'],
    summary:
      'OpTick investigates how landscape change, farm management, climate, and host ecology affect tick-borne disease exposure for livestock and people on UK farms.',
    description: [
      'OpTick is focused on understanding and mitigating the changing burden and impacts of tick-borne diseases in UK farmland.',
      'The project brings together ecology, epidemiology, economics, public and animal health, and social science to support surveillance tools, risk guidance, and management strategies for emerging and endemic tick-borne disease threats.'
    ],
    hubRelevance:
      'OpTick is expected to produce field evidence, risk guidance, stakeholder outputs, and modelling frameworks relevant to VBD Hub indexing and reuse.',
    searchQuery: 'OpTick',
    website: 'https://www.optick.ceh.ac.uk/'
  }
];

export function getProject(slug: string) {
  return fundedProjects.find((project) => project.slug === slug);
}
