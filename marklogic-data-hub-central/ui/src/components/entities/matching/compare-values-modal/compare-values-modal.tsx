import React, {useContext, useEffect, useState} from "react";
import {Modal} from "antd";
import "./compare-values-modal.scss";
import styles from "./compare-values-modal.module.scss";
import {MLTable} from "@marklogic/design-system";
import {Definition} from "../../../../types/modeling-types";
import {CurationContext} from "../../../../util/curation-context";
import backgroundImage from "../../../../assets/white-for-dark-bg.png";

interface Props {
   isVisible: any;
   toggleModal: (isVisible: boolean) => void;
   previewMatchActivity: any;
   uriInfo: any;
   activeStepDetails: any;
   entityProperties:any;
   uriCompared:any;
   entityDefinitionsArray:any;
   uris:any
}

const CompareValuesModal: React.FC<Props> = (props) => {
  let property1, property2;
  const {curationOptions} = useContext(CurationContext);
  const [matchedProperties, setMatchedProperties] = useState<any []>([]);
  const [compareValuesTableData, setCompareValuesTableData] = useState<any []>([]);

  useEffect(() => {
    if (props.isVisible && props.uriInfo) {
      getMatchedProperties();
      let parsedData = parseDefinitionsToTable(props.entityDefinitionsArray);
      setCompareValuesTableData(parsedData);
    }
  }, [props.isVisible]);

  const DEFAULT_ENTITY_DEFINITION: Definition = {
    name: "",
    properties: []
  };

  const getMatchedProperties = () => {
      for (let i in props.previewMatchActivity.actionPreview) {
          let allUris = props.previewMatchActivity.actionPreview[i].uris;
          if (allUris.includes(props.uris[0]) && allUris.includes(props.uris[1])) {
              for (let j in props.previewMatchActivity.actionPreview[i].matchRulesets) {
                  let matchRuleset = props.previewMatchActivity.actionPreview[i].matchRulesets[j];
                  let name = matchRuleset.split(" - ");
                  if(name.length > 1){
                      matchedProperties.push(name[0]);
                  }
                  else{
                      for(let i=0;i<curationOptions.activeStep.stepArtifact.matchRulesets.length;i++){
                          let ruleset=curationOptions.activeStep.stepArtifact.matchRulesets[i];
                          if(ruleset.name === matchRuleset){
                              for(let j=0;j<ruleset.matchRules.length;j++){
                                  matchedProperties.push(ruleset.matchRules[j].entityPropertyPath)
                              }
                          }
                      }
                  }
              }
              console.log("final Matched properties is ",matchedProperties)
          }
      }
  }

  const closeModal = () => {
    props.toggleModal(false);
  };

  const getPropertyPath = (parentKeys: any, structuredTypeName: string, propertyName: string, propertyPath?: string, arrayIndex?: number, parentPropertyName?: string) => {
    let updatedPropertyPath = "";
    if (!propertyPath) {
      if (parentPropertyName && arrayIndex!= undefined && arrayIndex >=0) {
        parentKeys.forEach(el => {
          let key = el.split(",")[0];
          if (key === parentPropertyName) {
            return !updatedPropertyPath.length ? updatedPropertyPath = `${key}[${arrayIndex}]` : updatedPropertyPath = updatedPropertyPath + "." + `${key}[${arrayIndex}]`;
          } else {
            return !updatedPropertyPath.length ? updatedPropertyPath = key : updatedPropertyPath = updatedPropertyPath + "." + key;
          }
        });
      } else {
        parentKeys.forEach(el => !updatedPropertyPath.length ? updatedPropertyPath = el.split(",")[0] : updatedPropertyPath = updatedPropertyPath + "." + el.split(",")[0]);
      }
      updatedPropertyPath = updatedPropertyPath + "." + structuredTypeName + "." + propertyName;
    } else {
      updatedPropertyPath = propertyPath + "." + structuredTypeName + "." + propertyName;
    }
    return updatedPropertyPath;
  };

  const propertyValueFromPath = (propertyPath, initialObj) => {
    let propPath = propertyPath.split(".").reduce((o, curr) => {
      if (curr.indexOf("[") !== -1) {
        let updatedCurr = curr.slice(0, curr.indexOf("["));
        let index = curr.slice(curr.indexOf("[") + 1, curr.indexOf("]"));
        if (o[updatedCurr] && Array.isArray(o[updatedCurr])) {
          return o[updatedCurr][index];
        } else {
          return o[updatedCurr] ? o[updatedCurr] : "";
        }
      } else {
        return !o[curr] ? "" : o[curr];
      }
    }, initialObj);
    return propPath;
  };

  const getPropertyPathForStructuredProperties = (parentKeys: any, propertyName: string) => {
    let propertyPath = "";
    parentKeys.forEach(el => !propertyPath.length ? propertyPath = el : propertyPath = propertyPath === el ? propertyPath : propertyPath + "." + el);
    propertyPath = propertyPath + "." + propertyName;
    return propertyPath;
  };

  const parseDefinitionsToTable = (entityDefinitionsArray: Definition[]) => {
    let entityTypeDefinition: Definition = entityDefinitionsArray.find(definition => definition.name === props.activeStepDetails.entityName) || DEFAULT_ENTITY_DEFINITION;
    return entityTypeDefinition?.properties.map((property, index) => {
      let propertyRow: any = {};
      let counter = 0;
      let propertyValueInURI1="";
      let propertyValueInURI2="";
      if (props.uriInfo) {
        property1=props.uriInfo[0]["result1Instance"][props.activeStepDetails.entityName];
        property2=props.uriInfo[1]["result2Instance"][props.activeStepDetails.entityName];
      }
      if (property.datatype === "structured") {
        const parseStructuredProperty = (entityDefinitionsArray, property, parentDefinitionName, parentKey, parentKeys, allParentKeys, propertyPath, indexArray?: number, tempParentKey?: string) => {
          let parsedRef = property.ref.split("/");
          console.log('parentKey',parentKey,indexArray, property,propertyPath,allParentKeys,tempParentKey )
          if (indexArray == undefined) {
            if (parentKey && !parentKeys.includes(parentKey)) {
              parentKeys.push(parentKey);
            } else {
              parentKeys.push(property.name + "," + index + (counter+1));
            }
          }
          //if (indexArray == undefined) {
            if (tempParentKey && !allParentKeys.includes(tempParentKey)) {
                allParentKeys.push(tempParentKey);
            } else {
              if (!allParentKeys.includes(tempParentKey)) {
                allParentKeys.push(property.name);
              } 
            }
          //}

          if (parsedRef.length > 0 && parsedRef[1] === "definitions") {
            let updatedPropPath= propertyPath ? propertyPath : property.name;
            let URI1Value:any = propertyValueFromPath(updatedPropPath, property1);
            let URI2Value:any = propertyValueFromPath(updatedPropPath, property2);
            let arrLength = 0;
            if ((URI1Value && Array.isArray(URI1Value)) || (URI2Value && Array.isArray(URI2Value))) {
              arrLength = URI1Value.length > URI2Value.length ? URI1Value.length : URI2Value.length;
            }
            let structuredType = entityDefinitionsArray.find(entity => entity.name === parsedRef[2]);
            let structuredTypePropertiesArray:any = [];
            let structuredTypeProperties: any;
            if (arrLength>0) {
              let parentKeysTempArray = [...parentKeys];
              for (let i = 0; i < arrLength; i++) {
                let allParentKeysTempArray = [...allParentKeys];
                let structTypeProperties = structuredType?.properties.map((structProperty, structIndex) => {
                  if (structProperty.datatype === "structured") {
                    // Recursion to handle nested structured types
                    counter++;
                    let parentDefinitionName = structuredType.name;
                    let immediateParentKey = (parentKey !== "" ? property.name : structProperty.name) + "," + index + counter + i;
                    let tempParKey = structProperty.name;// + "," + index + counter;
                    let propertyPathUri = propertyPath ? propertyPath : getPropertyPath(parentKeysTempArray, structuredType.name, structProperty.name, undefined, i, property.name);
                    return parseStructuredProperty(entityDefinitionsArray, structProperty, parentDefinitionName, immediateParentKey,parentKeysTempArray, allParentKeysTempArray, propertyPathUri, i,tempParKey);
                  } else {
                    let allParentKeysArray = [...allParentKeysTempArray];
                    let updatedPropertyPath = getPropertyPath(parentKeysTempArray, structuredType.name, structProperty.name, propertyPath, i, property.name);
                    let propertyValueInURI1 = propertyValueFromPath(updatedPropertyPath, property1);
                    let propertyValueInURI2 = propertyValueFromPath(updatedPropertyPath, property2);
                    let proPath = getPropertyPathForStructuredProperties(allParentKeysArray, structProperty.name)
                    let matchedRow = propertyValueInURI1 && propertyValueInURI2 && (JSON.stringify(propertyValueInURI1) === JSON.stringify(propertyValueInURI2)) ? matchedProperties.includes(proPath) : false;

                    let data1= {
                      key: property.name + "," + index + structIndex + counter + i,
                      propertyValueInURI1: {value: propertyValueInURI1,matchedRow: matchedRow},
                      propertyValueInURI2: {value: propertyValueInURI2,matchedRow: matchedRow},
                      structured: structuredType.name,
                      propertyName: {name: structProperty.name, matchedRow: matchedRow},
                      propertyPath: updatedPropertyPath,
                      type: structProperty.datatype === "structured" ? structProperty.ref.split("/").pop() : structProperty.datatype,
                      multiple: structProperty.multiple ? structProperty.name : "",
                      hasChildren: false,
                      hasParent: true,
                      parentKeys: allParentKeysArray,
                    };
                    return data1;
                  }
                });
                let parentKeysArray = [...parentKeysTempArray];
                let allParentKeysArray = [...allParentKeysTempArray];
                let arrayRow = {
                  key: property.name + "," + index + i + counter,
                  propertyValueInURI1: {value: propertyValueInURI1,matchedRow: false},
                  propertyValueInURI2: {value: propertyValueInURI2,matchedRow: false},
                  structured: structuredType.name,
                  propertyName: {name: (i+1)+" "+structuredType.name, matchedRow: matchedProperties.includes(property.name)},
                  propertyPath: getPropertyPath(parentKeysArray, structuredType.name, structuredType.name, propertyPath, i),
                  children: structTypeProperties,
                  hasChildren: true,
                  hasParent: true,
                  parentKeys: allParentKeysArray
                };
                structuredTypePropertiesArray.push(arrayRow);
              }

            } else {
              structuredTypeProperties = structuredType?.properties.map((structProperty, structIndex) => {
                if (structProperty.datatype === "structured") {
                  // Recursion to handle nested structured types
                  counter++;
                  let parentDefinitionName = structuredType.name;
                  let immediateParentKey = (parentKey !== "" ? property.name : structProperty.name) + "," + index + counter;
                  let propertyPath = getPropertyPath(parentKeys, structuredType.name, structProperty.name);
                  return parseStructuredProperty(entityDefinitionsArray, structProperty, parentDefinitionName, immediateParentKey, parentKeys, allParentKeys, propertyPath);
                } else {
                  let parentKeysArray = [...parentKeys];
                  let allParentKeysArray = [...allParentKeys];
                  let updatedPropertyPath = getPropertyPath(parentKeys, structuredType.name, structProperty.name, propertyPath);
                  let propertyValueInURI1 = propertyValueFromPath(updatedPropertyPath, property1);
                  let propertyValueInURI2 = propertyValueFromPath(updatedPropertyPath, property2);
                  let proPath = getPropertyPathForStructuredProperties(allParentKeysArray, structProperty.name);
                  let matchedRow = !propertyValueInURI1 || !propertyValueInURI2 ? false : matchedProperties.includes(proPath);
                  let data1= {
                    key: property.name + "," + index + structIndex + counter,
                    propertyValueInURI1: {value: propertyValueInURI1,matchedRow: matchedRow},
                    propertyValueInURI2: {value: propertyValueInURI2,matchedRow: matchedRow},
                    structured: structuredType.name,
                    propertyName: {name: structProperty.name, matchedRow: matchedRow},
                    propertyPath: getPropertyPath(parentKeysArray, structuredType.name, structProperty.name, propertyPath),
                    type: structProperty.datatype === "structured" ? structProperty.ref.split("/").pop() : structProperty.datatype,
                    multiple: structProperty.multiple ? structProperty.name : "",
                    hasChildren: false,
                    hasParent: true,
                    parentKeys: allParentKeysArray
                  };
                  return data1;
                }
              });
            }

            let hasParent = parentKey !== "";
            //let parentKeysArray = [...parentKeys];
            let allParentKeysArray = [...allParentKeys];
            let data2= {
              key: property.name + "," + index + counter,
              structured: structuredType.name,
              propertyValueInURI1: {value: "",matchedRow: false},
              propertyValueInURI2: {value: "",matchedRow: false},
              propertyName: {name: property.name, matchedRow: matchedProperties.includes(property.name)},
              propertyPath: hasParent ? getPropertyPath(parentKeys, structuredType.name, property.name, propertyPath) : property.name,
              multiple: property.multiple ? property.name : "",
              type: property.ref.split("/").pop(),
              children: arrLength ? structuredTypePropertiesArray : structuredTypeProperties,
              hasChildren: true,
              hasParent: hasParent,
              parentKeys: hasParent ? allParentKeysArray : []
            };
               console.log("Data 2 ",data2,parentKey,allParentKeysArray)
              return data2
          }
        };
        propertyRow = parseStructuredProperty(entityDefinitionsArray, property, "", undefined, [], [], "");
        counter++;
      } else {
        // To handle non structured properties
        if (props.uriInfo !== undefined) {
          propertyValueInURI1 = property1[property.name];
          propertyValueInURI2 = property2[property.name];
          if (propertyValueInURI1 === undefined ||  propertyValueInURI2 === undefined) {
            propertyValueInURI1="";
            propertyValueInURI2="";
          }
        }

        let matchedRow = !propertyValueInURI1 || !propertyValueInURI2 ? false : matchedProperties.includes(property.name);
        propertyRow = {
          key: property.name + "," + index,
          propertyValueInURI1: {value: propertyValueInURI1, matchedRow: matchedRow},
          propertyValueInURI2: {value: propertyValueInURI2, matchedRow: matchedRow},
          propertyName: {name: property.name, matchedRow: matchedRow},
          propertyPath: property.name,
          type: property.datatype,
          identifier: entityTypeDefinition?.primaryKey === property.name ? property.name : "",
          multiple: property.multiple ? property.name : "",
          hasChildren: false,
          parentKeys: []
        };
      }
      return propertyRow;
    });
  };

  const columns = [
    {
      dataIndex: "propertyName",
      key: "propertyPath",
      width: "20%",
      ellipsis: true,
      render: (text, row) => {
        return {
          props: {
              style: {backgroundImage: text.matchedRow ? 'url('+ backgroundImage+')' : "",backgroundColor: text.matchedRow ? "#85BF97" : ""}
          },
          children: <span className={row.hasOwnProperty("children") ? styles.nameColumnStyle : ""} aria-label={text.name}>{text.name}</span>
        };
      }
    },
    {
      dataIndex: "propertyValueInURI1",
      key: "propertyValueInURI1",
      width: "40%",
      ellipsis: true,
      render: (property, key) => {
        return {
          props: {
              style: {backgroundImage: property.matchedRow ? 'url('+ backgroundImage+')' : "",backgroundColor: property.matchedRow ? "#85BF97" : ""}
          },
          children: <span key={key} aria-label={property.value.length > 0 ? property.value : "empty"}>{property.value}</span>
        };
      }
    },
    {
      dataIndex: "propertyValueInURI2",
      key: "propertyValueInURI2",
      width: "40%",
      ellipsis: true,
      render: (property, key) => {
        return {
          props: {
              style: {backgroundImage: property.matchedRow ? 'url('+ backgroundImage+')' : "",backgroundColor: property.matchedRow ? "#85BF97" : ""}
          },
          children: <span key={key} aria-label={property.value.length > 0 ? property.value : "empty"}>{property.value}</span>
        };
      }
    },
  ];
  return <Modal
    visible={props.isVisible}
    closable={true}
    maskClosable={false}
    title={null}
    footer={null}
    width={1400}
    destroyOnClose={true}
    onCancel={closeModal}
    onOk={closeModal}
  >
    <div><div className={styles.compareValuesModalHeading}>Compare</div>
      <div>
        <span className={styles.customer1}>Customer 1</span>
        <span className={styles.customer2}>Customer 2</span>
      </div>
      <div className={styles.compareTableHeader}>
        <span className={styles.uri1}>{props.uriCompared[0]}</span>
        <span className={styles.uri2}>{props.uriCompared[1]}</span>
      </div>
      <span><img src={backgroundImage} className={styles.matchIcon}></img></span>
      <span className={styles.matchIconText}>Match</span>
    </div>
    <MLTable
      dataSource={compareValuesTableData}
      className={styles.compareValuesTable}
      columns={columns}
      rowKey="key"
      id="compareValuesTable"
    >
    </MLTable>
  </Modal>;
};

export default CompareValuesModal;
