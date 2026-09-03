import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// O projeto não instala @types/react, então `React.Component` resolve para
// `any` (pre-existing em todo o codebase). Isso faz o TS não enxergar os
// membros herdados (props/state/setState). A tipagem em tempo de execução vem
// da classe real do React; aqui apenas informamos essas assinaturas ao TS sem
// sobrescrever nada em runtime.
type Bounds = {
  props: ErrorBoundaryProps;
  setState: (
    partial: Partial<ErrorBoundaryState> | ((prev: ErrorBoundaryState) => Partial<ErrorBoundaryState>)
  ) => void;
};

/**
 * Captura erros de renderização para evitar que um único componente
 * derrube a árvore inteira (tela branca + reload).
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  private get bounds(): Bounds {
    return this as unknown as Bounds;
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('ErrorBoundary capturou erro:', error, info);
  }

  handleReset = () => {
    this.bounds.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.bounds.props.fallback) return this.bounds.props.fallback;
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px' }}>Algo deu errado.</h2>
          <p style={{ margin: '0 0 16px', color: '#64748b' }}>
            Ocorreu um erro ao renderizar esta parte da aplicação.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#4f46e5',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.bounds.props.children;
  }
}
