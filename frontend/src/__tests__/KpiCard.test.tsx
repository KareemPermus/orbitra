import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import KpiCard from '@/components/dashboard/KpiCard';

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Total" value={42} icon={<span>IC</span>} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});