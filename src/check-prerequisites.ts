import { every } from 'lodash';
import shell from 'shelljs';
import { pathExistsSync } from 'fs-extra';

interface IDeps {
    binaries?: string[];
    files?: string[];
}

export async function testDeps(deps: IDeps) {
    deps.binaries = deps.binaries || [];
    deps.files = deps.files || [];

    const binaryChecks = deps.binaries.map((binary) => ({binary, doesExist: !!shell.which(binary)}));

    const areAllBinariesAvailable = every(binaryChecks, (binaryCheck) => binaryCheck.doesExist);

    if (!areAllBinariesAvailable) {
        const missingDeps = binaryChecks
            .filter((binaryCheck) => !binaryCheck.doesExist)
            .map((binaryCheck) => binaryCheck.binary);

        throw new Error(`Dependency error: The following dependencies are missing: ${ missingDeps.join(', ') }.\nDid you run 'sudo npm run-script provision'?`);
    }

    const filesChecks = deps.files.map((filePath) => ({filePath, doesExist: pathExistsSync(filePath)}));
    const areAllFilesAvailable = every(filesChecks, (fileCheck) => fileCheck.doesExist);

    if (!areAllFilesAvailable) {
        const missingFiles = filesChecks
            .filter((fileCheck) => !fileCheck.doesExist)
            .map((fileCheck) => fileCheck.filePath);

        throw new Error(`The following files are missing: ${ missingFiles.join(', ') }.`);
    }

    return true;
}