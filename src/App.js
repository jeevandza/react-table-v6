import React, { useState, useEffect } from 'react';
import './style.css';
import namor from 'namor';
import ReactTable from 'react-table-v6';
import 'react-table-v6/react-table.css';

const range = (length) => {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr.push(i);
  }
  return arr;
};

const newPerson = () => {
  const statusChance = Math.random();
  return {
    UserId: Math.floor(Math.random() * 30),
    Id: Math.floor(Math.random() * 100),
    Title: namor.generate({ words: 1, numbers: 0 }),
    Content: namor.generate({ words: 1, numbers: 0 }),
    status:
      statusChance > 0.75
        ? 'Completee'
        : statusChance > 0.5
        ? 'In Progress'
        : statusChance > 0.25
        ? 'Pending'
        : 'Yet to start',
  };
};

const makeData = (...lengths) => {
  const makeDataLevel = (depth = 0) => {
    const length = lengths[depth];
    return range(length).map((d) => {
      return {
        ...newPerson(),
        subRows: lengths[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      };
    });
  };
  return makeDataLevel();
};

const SelectCommonFilter = ({ filter, onChange, options, accessor }) => {
  // console.log(filter, onChange, accessor);
  return (
    <select
      onChange={(event) => {
        let selectedOptions = [].slice
          .call(event.target.selectedOptions)
          .map((o) => {
            return o.value;
          });

        onChange(selectedOptions, accessor);
      }}
      style={{ width: '100%' }}
      value={filter ? filter.value[0] : 'all'}
    >
      {options}
    </select>
  );
};

const capitaliseStr = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1, str.length);

export default function App() {
  const [data, setData] = useState(() => makeData(5));
  const [newData, setNewData] = useState(data);
  const [isChecked, setIsChecked] = useState(false);

  const [filtered, setFiltered] = useState([]);

  const handleSelectOne = (props) => {
    if (!isChecked) {
      const _person = data.find((person) => {
        return (person.id = data.Id);
      });
      setIsChecked(_person);
    } else {
      setIsChecked(false);
    }
  };

  const handleSelectAll = (props) => {
    if (!isChecked) {
      setIsChecked(props);
    } else {
      setIsChecked(false);
    }
  };

  useEffect(() => {
    console.log(data, isChecked);
    if (isChecked === true) {
      setIsChecked(true);
    }
  }, [isChecked]);

  const onFilteredChangeCustom = (value, accessor) => {
    // console.log('onFilteredChangeCustom', value, accessor);
    let _filtered = [...filtered];
    let insertNewFilter = 1;

    if (_filtered.length) {
      _filtered.forEach((filter, i) => {
        if (filter['id'] === accessor) {
          if (value === '' || !value.length) _filtered.splice(i, 1);
          else filter['value'] = value;

          insertNewFilter = 0;
        }
      });
    }

    if (insertNewFilter) {
      _filtered.push({ id: accessor, value: value });
    }

    setFiltered(_filtered);
  };

  const DeleteRow = (props) => {
    const _data = data.filter((singlerow) => {
      return singlerow !== props;
    });
    setData(_data);
  };

  const columns = [
    {
      Header: 'User Table',
      columns: [
        {
          id: 'checkbox',
          accessor: '',
          Cell: (props) => {
            return (
              <div>
                <input
                  id="checkbox"
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleSelectOne(props.original.Id)}
                />
              </div>
            );
          },
          Header: (props) => {
            return (
              <input
                id="checkbox"
                type="checkbox"
                checked={isChecked}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = data.index === 2;
                  }
                }}
                onChange={() => handleSelectAll(props)}
              />
            );
          },
          sortable: true,
          width: 45,
        },
        {
          Header: 'UserId',
          accessor: 'UserId',
        },
        {
          Header: 'ID',
          accessor: 'Id',
        },
        {
          Header: 'Title',
          accessor: 'Title',
        },
        {
          Header: 'Content',
          accessor: 'Content',
        },
        {
          Header: (props) => <span>Status</span>,
          accessor: 'status',
          Filter: ({ filter, onChange }) => {
            return (
              <SelectCommonFilter
                filter={filter}
                accessor="status"
                onChange={onFilteredChangeCustom}
                options={
                  <>
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="in progress">In progress</option>
                    <option value="pending">Pending</option>
                    <option value="yet to start">Yet to start</option>
                  </>
                }
              />
            );
          },
          Cell: (cellInfo) => capitaliseStr(cellInfo.value),
        },
        {
          Header: 'Actions',
          Cell: (props) => {
            return (
              <div className="action-coloum">
                <button
                  type="button"
                  style={{ background: 'red', color: '#fefefe' }}
                  onClick={(e) => DeleteRow(props.original)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  style={{ background: 'green', color: '#fefefe' }}
                  onClick={(e) => AddRow(props)}
                >
                  Add
                </button>
              </div>
            );
          },
          width: 150,
          textAlign: 'center',
        },
      ],
    },
  ];
  return (
    <div>
      <ReactTable
        filterable
        sortable
        filtered={filtered}
        data={data}
        columns={columns}
        onFilteredChange={(filtered, column, value) => {
          onFilteredChangeCustom(value, column.id || column.accessor);
        }}
        defaultFilterMethod={(filter, row, column) => {
          const id = filter.pivotId || filter.id;
          if (filter.value[0] === 'all') {
            return true;
          }
          if (typeof filter.value === 'object') {
            return row[id] !== undefined
              ? filter.value.indexOf(row[id]) > -1
              : true;
          } else {
            return row[id] !== undefined
              ? String(row[id]).indexOf(filter.value) > -1
              : true;
          }
        }}
      />
    </div>
  );
}
