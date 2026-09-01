import React from 'react';
import Loader from './Loader';
import EmptyState from './EmptyState';

const Table = ({
  headers = [],
  children,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data matching your logs.',
  emptyIcon = '📅',
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div className={`table-card-container ${className}`} style={{ ...style, display: 'flex', flexDirection: 'column' }} {...props}>
      {isLoading ? (
        <div style={{ padding: '60px 0' }}>
          <Loader size="md" label="Loading table records..." />
        </div>
      ) : isEmpty ? (
        <EmptyState icon={emptyIcon} message={emptyMessage} style={{ padding: '40px 20px' }} />
      ) : (
        <div className="table-responsive">
          <table className="prescription-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            {headers.length > 0 && (
              <thead>
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx}>{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>{children}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Table;
