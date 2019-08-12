import {FormOutputData} from '../shared-dialogs/create-update/create-update-dialog.component'

export function createProtocol<Protocol>(output: FormOutputData[], empty: Protocol): Protocol {
    return output.reduce((json, data) => {
        json[data.formControlName] = data.value
        return json
    }, empty)
}

export function withCreateProtocol<Protocol>(output: FormOutputData[], empty: Protocol, update: (p: Protocol) => void): Protocol {
    const protocol = createProtocol(output, empty)
    update(protocol)
    return protocol
}
