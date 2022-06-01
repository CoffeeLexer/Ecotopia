module.exports = {
    meeting_deep,
    notification
}

function meeting_deep(array) {
    array.forEach((e, i, arr) => {
        arr[i].resources = JSON.parse(e.resources)
        arr[i].execution = JSON.parse(e.execution)
        arr[i].execution.organiser = JSON.parse(e.execution.organiser)
        arr[i].execution.participants = JSON.parse(e.execution.participants)
        arr[i].challenge = JSON.parse(e.challenge)
        arr[i].challenge.author = JSON.parse(e.challenge.author)
        arr[i].challenge.images = JSON.parse(e.challenge.images)
        arr[i].challenge.location = JSON.parse(e.challenge.location)
    })
    return array
}
function notification(array) {
    array.forEach((e, i, arr) => {
        arr[i].content = JSON.parse(e.content)
        arr[i].fk_account = undefined
    })
    return array
}