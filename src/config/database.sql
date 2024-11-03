PRAGMA foreign_keys = ON;

-- TABLE TO REFERENCE DIFFERENT THEMES THAT ARE BEING ASSESSED WITH THE REGEXES
DROP TABLE IF EXISTS cyb_filters;
DROP TABLE IF EXISTS cyb_types;
DROP TABLE IF EXISTS cyb_users;
DROP TABLE IF EXISTS cyb_connect;

-- CONNECTION TABLE
CREATE TABLE cyb_connect (
    id_con INTEGER NOT NULL,
    username_con TEXT NOT NULL,
    PRIMARY KEY(id_con)
);

-- TABLE USERS
CREATE TABLE cyb_users (
    id_usr INTEGER NOT NULL,
    username_usr TEXT NOT NULL,
    password_usr TEXT NOT NULL,
    status_usr TEXT NOT NULL,   -- manage right privileges
    active_usr TEXT NOT NULL,   -- can access to the API or not
    email_usr TEXT,
    salt_usr TEXT NOT NULL,
    id_con INT NOT NULL,
    PRIMARY KEY (id_usr),
    FOREIGN KEY (id_con) REFERENCES cyb_connect(id_con)
);


CREATE TABLE cyb_types (
    id_typ INTEGER NOT NULL,
    type_typ TEXT,
    PRIMARY KEY (id_typ)
);

-- TABLE TO TEST REGEX
CREATE TABLE cyb_filters (
    id_ftr INTEGER NOT NULL,
    regex_ftr TEXT NOT NULL,
    description_ftr TEXT,
    created_ftr DATETIME,
    last_update_ftr DATETIME,
    id_typ INTEGER NOT NULL,
    id_con INTEGER NOT NULL,
    PRIMARY KEY (id_ftr),
    FOREIGN KEY (id_typ) REFERENCES cyb_types(id_typ),
    FOREIGN KEY (id_con) REFERENCES cyb_connect(id_con)
);

-- ******************* USERS ********************************
-- SHA 512 ENCRYPTION --
-- connect table
INSERT INTO cyb_connect (id_con, username_con) VALUES (1, 'cyberadmin');
INSERT INTO cyb_connect (id_con, username_con) VALUES (2, 'toto');

--users table
INSERT INTO cyb_users (id_usr, username_usr, password_usr, status_usr, active_usr, email_usr, salt_usr, id_con)
VALUES (1, 'cyberadmin', 'cef1e0559cb4f936240055c95deba4431b6cfe4324696ccd5fbdacd16516649f02b9ba64deb6be22ab2663d6442833ea82f0d2bcce2426aa0d439531b0dabbdb', 'admin', 'active', 'cyberadmin@adm.org', 'n_af/jk*f50D9-g><+q98mkf=1Pm3.9', 1);

INSERT INTO cyb_users (id_usr, username_usr, password_usr, status_usr, active_usr, email_usr, salt_usr, id_con)
VALUES (2, 'toto', 'c416e5de978781931c9f02ca576490ab8312df5028db1f61aa471e6b7167fcaeeb58b81f47385ad4bd056839a7b7e3e6185255c94d35a367169d71c1873a01ee', 'staff', 'active', 'cybertoto@admn.org', 'j45)Zb98%h+wv76X!$4*T{32rB§s?E', 2);

-- ******************* FILTERS ******************************

-- TYPES
INSERT INTO cyb_types (id_typ, type_typ) VALUES (1, 'XSS ATTACK');
INSERT INTO cyb_types (id_typ, type_typ) VALUES (2, 'SQL ATTACK');

-- FILTERS /* sqlite: double apostrophes to escape them */
INSERT INTO cyb_filters (id_ftr, regex_ftr, description_ftr, id_typ, id_con)
VALUES (1, '<script((\s+\w+(\s*=\s*((.?:"(.)*")|(''(.)*'')|([^''\">\s]+)))?)+\s*|\s*)src', 'XSS in URL', 1, 1);

INSERT INTO cyb_filters (id_ftr, regex_ftr, description_ftr, id_typ, id_con)
VALUES (2, '((\%3D)|(=))[^\n]\*((\%3C)|<)\[^\n\]+((\%3E)|>)', 'Network Intrusion Detection System filter (NIDS)', 1, 1);

-- -- SQL Injection Pattern
INSERT INTO cyb_filters (id_ftr, regex_ftr, description_ftr, id_typ, id_con)
VALUES (3, '(\s*([\0\b''\"\n\r\t\%\_\\]*\s*(((select\s*.+\s*from\s*.+)|(insert\s*.+\s*into\s*.+)|(update\s*.+\s*set\s*.+)|(delete\s*.+\s*from\s*.+)|(drop\s*.+)|(truncate\s*.+)|(alter\s*.+)|(exec\s*.+)|(\s*(all|any|not|and|between|in|like|or|some|contains|containsall|containskey)\s*.+[=><=\\!\\~]+.+)|(let\s+.+[=]\s*.*)|(begin\s*.*\s*end)|(\s*[/*]+\s*.*\s*[*]+)|(\s*(--+)\s*.*\s+)|(\s*(contains|containsall|containskey)\s+.*)))(\s*[;]+)+)+)', 'SQL injections', 2, 1);

INSERT INTO cyb_filters (id_ftr, regex_ftr, description_ftr, id_typ, id_con)
VALUES (4, '\s*(\"|'')\s*or\s*('')?1('')?\s*\=\s*1;?', 'SQL always true', 2, 1);
