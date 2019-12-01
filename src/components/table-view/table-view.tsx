import React, { useState } from 'react';
import { Table } from 'antd';

interface Props {
  document: any;
  contentType: string;
  location:{};
};

const TableView: React.FC<Props> = (props) => {
  //console.log(typeof(props.location))
  const [expanded, setExpanded] = useState(false);

  let data = new Array();
  //let deleteKey = 0;
  let counter = 0;
  let expandCounter = 0;
  let expandRow = 0;
  const parseJson = (obj: Object) => {
    let parsedData = new Array();
    for (var i in obj) {
      console.log("received:",i)
      console.log("sent:",props.location)
      if(props.location && props.location === i){
        console.log("inside - you can delete this")
        expandRow = expandCounter
        //deleteKey = counter-1;
        //console.log(deleteKey)
      }
      expandCounter++

      if (obj[i] !== null && typeof (obj[i]) === "object") {
        parsedData.push({ key: counter++, property: i, children: parseJson(obj[i]) });
      } else {
        parsedData.push({ key: counter++, property: i, value: typeof obj[i] === 'boolean' ? obj[i].toString() : obj[i] });
      }
     // console.log(i)
      //console.log(props.location)

    }
    return parsedData;
  }

  if (props.document.envelope || props.document.content.envelope) {
    if (props.contentType === 'json') {
      Object.keys(props.document.envelope.instance).forEach(instance => {
        if (instance !== 'info') {
          data = parseJson(props.document.envelope.instance[instance]);
        }
      });
    } else if (props.contentType === 'xml') {
      Object.keys(props.document.content.envelope.instance).forEach(instance => {
        if (instance !== 'info') {
          data = parseJson(props.document.content.envelope.instance[instance]);
        }
      });
    }
  }




  const handleClick = () => {
    expanded === false ? setExpanded(true) : setExpanded(false)
  }

  const columns = [
    {
      title: 'Property',
      dataIndex: 'property',
      width: '20%',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      render: (value: string) => {
        const pStyle = {
          whiteSpace: !expanded ? "nowrap" : "normal",
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          maxWidth: '150ex',
          cursor: 'pointer',
          padding: '0',
          margin: '0'
        } as React.CSSProperties
        return <p onClick={() => handleClick()} style={pStyle}>{value}</p>
      },
      width: '80%',
    }
  ];

  return (
        <Table
            className="document-table-demo"
            rowKey="key"
            dataSource={data}
            columns={columns}
            pagination={false}
            data-cy="document-table"
            //defaultExpandAllRows={props.location && (props.location === 'nested-instance')}
            defaultExpandedRowKeys = {[expandRow]}
        />
  )
}

export default TableView;