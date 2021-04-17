import React, {useContext} from "react";
import { Progress} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./expandable-table-view.module.scss";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {MLTable} from "@marklogic/design-system";

interface Props {
key: any;
rowData: any;
allRuleset: any;
tableShow: boolean;
}

let counter = 0;

const testMatchedUriTableColumns = [
    {
        title: "Ruleset",
        dataIndex: "ruleName",
        key: "ruleName "+ (counter++),
        width: "16%",
        render: (ruleName, key) => (ruleName.map(property => {
            return <span className={styles.rulesetColumn} key={key}>{property}
          </span>;
        }))
    },
    {
        title: "Exact",
        dataIndex: "matchedRulesetType",
        key: "matchedRulesetType " + (counter++) + " exact",
        width: "6%",
        render: (matchedRulesetType, key) => (matchedRulesetType.map(rulesetType => {
            return (rulesetType === "Exact") && <span className={styles.testMatchedColumns} key={key}>
            <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType} />
          </span>;
        }))
    },
    {
        title: "Synonym",
        dataIndex: "matchedRulesetType",
        key: "matchedRulesetType " + (counter++) + " synonym",
        width: "8%",
        render: (matchedRulesetType, key) => (matchedRulesetType.map(rulesetType => {
            return (rulesetType === "Synonym") && <span className={styles.testMatchedColumns} key={key}>
            <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
          </span>;
        }))
    },
    {
        title: "Double Metaphone",
        dataIndex: "matchedRulesetType",
        width: "10%",
        key: "matchedRulesetType " + (counter++) + " metaphone",
        render: (matchedRulesetType, key) => (matchedRulesetType.map(rulesetType => {
            return (rulesetType === "Double Metaphone") && <span className={styles.testMatchedColumns} key={key}>
            <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
          </span>;
        }))
    },
    {
        title: "Zip",
        dataIndex: "matchedRulesetType",
        key: "matchedRulesetType " + (counter++) + " zip",
        width: "6%",
        render: (matchedRulesetType, key) => (matchedRulesetType.map(rulesetType => {
            return (rulesetType === "Zip") && <span className={styles.testMatchedColumns} key={key}>
            <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
          </span>;
        }))
    },
    {
        title: "Reduce",
        dataIndex: "matchedRulesetType",
        key: "matchedRulesetType " + (counter++) + " reduce",
        width: "7%",
        render: (matchedRulesetType, key) => (matchedRulesetType.map(rulesetType => {
            return (rulesetType === "Reduce") && <span className={styles.testMatchedColumns} key={key}>
            <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
          </span>;
        }))
    },
    {
        title: "Custom",
        dataIndex: "matchedRulesetType",
        key: "matchedRulesetType " + (counter++) + " custom",
        width: "8%",
        render: (matchedRulesetType, key) => (matchedRulesetType.map(rulesetType => {
            return (rulesetType === "Custom") && <span className={styles.testMatchedColumns} key={key}>
            <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
          </span>;
        }))
    },
    {
        title: "Match Score",
        dataIndex: "scores[0]",
        key: "matchedRulesetType " + (counter++) + " score",
        width: "15%",
        render: (score, key) =>  <span key={key}>
          <Progress percent={score} strokeWidth={20} strokeColor={"#00b300"} format={percent => `${percent}`} strokeLinecap={"square"}/>
        </span>
    }
];

const ExpandableTableView: React.FC<Props> = (props) => {
    console.log("props are ",props)
  let allRuleset = props.allRuleset;
    let actionPreviewData = props.rowData.matchRulesets.map(matchRulseset => {
        let matchedRulesetProperty: string[] = [];
        let matchedRulesetType: string[] = [];
        let scores: string[] = [];
        let ruleName: string[] = [];
        let key= counter++;
        ruleName.push(matchRulseset);
        let ruleset = matchRulseset.split(" - ");
        matchedRulesetProperty.push(ruleset[0]);
        matchedRulesetType.push(ruleset[1]);
        for (let i=0;i<allRuleset.length;i++) {
            if (matchRulseset === allRuleset[i].name) {
                scores.push(allRuleset[i].weight);
            }
        }
        let data = {
            matchedRulesetProperty: matchedRulesetProperty,
            matchedRulesetType: matchedRulesetType,
            ruleName: ruleName,
            scores: scores,
            key: key,
        };
        return data;
    });
    return props.tableShow === false? <div className={styles.expandedTableView}><MLTable
        columns={testMatchedUriTableColumns}
        dataSource={actionPreviewData}
        pagination={false}
        rowKey="key"
        id="uriMatchedDataTable">
       </MLTable>
       <div className={styles.boldTextDisplay}> Total Score: {props.rowData.score}</div></div> : null;
}
export default ExpandableTableView;
