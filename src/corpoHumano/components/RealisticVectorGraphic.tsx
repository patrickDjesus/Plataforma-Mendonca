import React from 'react';
import {
  BrainVector,
  HeartVector,
  LungsVector,
  StomachVector,
  LiverVector,
  PancreasVector,
  KidneysVector,
  GenericOrganVector,
} from './realistic/OrganVectorGraphics';
import {
  MitochondriaVector,
  NucleusVector,
  RerVector,
  GolgiVector,
  LysosomeVector,
  MembraneVector,
} from './realistic/CellVectorGraphics';

interface RealisticVectorGraphicProps {
  id: string;
  name?: string;
  scientificName?: string;
  icon?: string;
  themeColor?: string;
}

export const RealisticVectorGraphic: React.FC<RealisticVectorGraphicProps> = ({
  id,
  name = '',
  scientificName = '',
  icon = '🔬',
  themeColor = '#3b82f6',
}) => {
  switch (id) {
    // Orgãos
    case 'cerebro':
      return <BrainVector themeColor={themeColor} />;
    case 'coracao':
      return <HeartVector themeColor={themeColor} />;
    case 'pulmoes':
      return <LungsVector themeColor={themeColor} />;
    case 'estomago':
      return <StomachVector themeColor={themeColor} />;
    case 'figado':
      return <LiverVector themeColor={themeColor} />;
    case 'pancreas':
      return <PancreasVector themeColor={themeColor} />;
    case 'rins':
      return <KidneysVector themeColor={themeColor} />;

    // Organelas
    case 'mitocondria':
      return <MitochondriaVector themeColor={themeColor} />;
    case 'nucleo':
      return <NucleusVector themeColor={themeColor} />;
    case 'reticulo_rugoso':
      return <RerVector themeColor={themeColor} />;
    case 'complexo_golgi':
      return <GolgiVector themeColor={themeColor} />;
    case 'lisossomo':
      return <LysosomeVector themeColor={themeColor} />;
    case 'membrana_plasmatica':
      return <MembraneVector themeColor={themeColor} />;

    default:
      return (
        <GenericOrganVector
          title={name || id}
          subtitle={scientificName || 'Diagrama Científico Vetorial'}
          icon={icon}
          color={themeColor}
        />
      );
  }
};
