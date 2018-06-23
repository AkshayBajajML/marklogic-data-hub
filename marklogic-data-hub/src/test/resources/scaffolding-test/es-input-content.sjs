'use strict'

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/
function createContent(id, rawContent, options) {


  let source;

  // for xml we need to use xpath
  if(rawContent && xdmp.nodeKind(rawContent) === 'element' && rawContent instanceof XMLDocument) {
    source = fn.head(rawContent.xpath('/*:envelope/*:instance/node()'));
  }
  // for json we need to return the instance
  else if(rawContent && rawContent instanceof Document) {
    source = fn.head(rawContent.root);
  }
  // for everything else
  else {
    source = rawContent;
  }

  return extractInstanceMyFunTest(source);
}

/**
 * Creates an object instance from some source document.
 * @param source  A document or node that contains
 *   data for populating a my-fun-test
 * @return An object with extracted data and
 *   metadata about the instance.
 */
function extractInstanceMyFunTest(source) {
  // the original source documents
  let attachments = source;
  // now check to see if we have XML or json, then just go to the instance
  if(source instanceof Element) {
    source = fn.head(source.xpath('/*:envelope/*:instance/*:root/node()'))
  } else if(source instanceof ObjectNode) {
    source = source.envelope.instance;
  }
  let name = !fn.empty(source.name) ? xs.string(fn.head(source.name)) : null;
  let price = !fn.empty(source.price) ? xs.decimal(fn.head(source.price)) : null;
  let ages = !fn.empty(source.ages) ? xs.int(fn.head(source.ages)) : null;

  /* The following property is a local reference. */
  let employee = null;
  if (source.employee) {
    // either return an instance of a Employee
    employee = extractInstanceEmployee(item.Employee);

    // or a reference to a Employee
    // employee = makeReferenceObject('Employee', item);
  };

  /* The following property is a local reference. */
  let employees = [];
  if (source.employees) {
    // either return an instance of a Employee
    employees.push(extractInstanceEmployee(item.Employee));

    // or a reference to a Employee
    // employees.push(makeReferenceObject('Employee', item));
  };

  // return the instance object
  return {
    '$attachments': attachments,
    '$type': 'my-fun-test',
    '$version': '0.0.1',
    'name': name,
    'price': price,
    'ages': ages,
    'employee': employee,
    'employees': employees
  }
};

/**
 * Creates an object instance from some source document.
 * @param source  A document or node that contains
 *   data for populating a Employee
 * @return An object with extracted data and
 *   metadata about the instance.
 */
function extractInstanceEmployee(source) {
  // the original source documents
  let attachments = source;
  // now check to see if we have XML or json, then just go to the instance
  if(source instanceof Element) {
    source = fn.head(source.xpath('/*:envelope/*:instance/*:root/node()'))
  } else if(source instanceof ObjectNode) {
    source = source.envelope.instance;
  }
  let id = !fn.empty(source.id) ? xs.string(fn.head(source.id)) : null;
  let name = !fn.empty(source.name) ? xs.string(fn.head(source.name)) : null;
  let salary = !fn.empty(source.salary) ? xs.decimal(fn.head(source.salary)) : null;

  // return the instance object
  return {
    '$type': 'Employee',
    '$version': '0.0.1',
    'id': id,
    'name': name,
    'salary': salary
  }
};


function makeReferenceObject(type, ref) {
  return {
    '$type': type,
    '$ref': ref
  };
}

module.exports = {
  createContent: createContent
};

