PRAGMA foreign_keys = ON;

-- TABLE TO REFERENCE DIFFERENT THEMES THAT ARE BEING ASSESSED WITH THE REGEXES
DROP TABLE IF EXISTS cyb_filters;
DROP TABLE IF EXISTS cyb_types;

CREATE TABLE cyb_types (
    id_typ INTEGER NOT NULL,
    type_typ TEXT,
    PRIMARY KEY (id_typ)
    );

-- TABLE TO TEST REGEX
CREATE TABLE cyb_filters (
    id_ftr INTEGER NOT NULL,
    regex_ftr TEXT NOT NULL,
    id_typ INTEGER NOT NULL,
    description_ftr TEXT,
    PRIMARY KEY (id_ftr),
    FOREIGN KEY (id_typ) REFERENCES cyb_types(id_typ)
);


-- TYPES
INSERT INTO cyb_types (id_typ, type_typ) VALUES (1, 'XSS');
INSERT INTO cyb_types (id_typ, type_typ) VALUES (2, 'SQL');


-- FILTERS /* sqlite: double apostrophes to escape them */
INSERT INTO cyb_filters (id_ftr, regex_ftr, id_typ, description_ftr)
VALUES (1, '\\<script((\\s+\\w+(\\s*=\\s*(?:\"(.)*?\"|''(.)*?''|\\[^''\"\\>\\s\\]+))?)+\\s*|\\s*)src', 1, 'XSS in URL');

INSERT INTO cyb_filters (id_ftr, regex_ftr, id_typ, description_ftr)
VALUES (2, '((\\%3D)|(=))\\[^\\n]\\*((\\%3C)|<)\\[^\\n\\]+((\\%3E)|>)', 1, 'Network Intrusion Detection System filter (NIDS)');

-- SQL Injection Pattern
INSERT INTO cyb_filters (id_ftr, regex_ftr, id_typ, description_ftr)
VALUES (4, '(\\s*([\\0\\b\\''\\\"\\n\\r\\t\\%\\_\\\\]*\\s*(((select\\s*.+\\s*from\\s*.+)|(insert\\s*.+\\s*into\\s*.+)|(update\\s*.+\\s*set\\s*.+)|(delete\\s*.+\\s*from\\s*.+)|(drop\\s*.+)|(truncate\\s*.+)|(alter\\s*.+)|(exec\\s*.+)|(\\s*(all|any|not|and|between|in|like|or|some|contains|containsall|containskey)\\s*.+[=><=\\!\\~]+.+)|(let\\s+.+[=]\\s*.*)|(begin\\s*.*\\s*end)|(\\s*[/*]+\\s*.*\\s*[*]+)|(\\s*(--+)\\s*.*\\s+)|(\\s*(contains|containsall|containskey)\\s+.*)))(\\s*[;]+)+)+)', 2, 'SQL injections');
