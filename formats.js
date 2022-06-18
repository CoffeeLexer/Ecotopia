module.exports = {
    meeting_deep,
    notification,
    execution_full,
    challenge_deep,
    post_full
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
function execution_full(array) {
    array.forEach((e, i, arr) => {
        arr[i].organiser = JSON.parse(e.organiser)
        if(e.current_meeting) {
            arr[i].current_meeting = JSON.parse(e.current_meeting)
            arr[i].current_meeting.resources = JSON.parse(e.current_meeting.resources)
        }
        arr[i].challenge = JSON.parse(e.challenge)
        arr[i].challenge.author = JSON.parse(e.challenge.author)
        arr[i].challenge.location = JSON.parse(e.challenge.location)
        arr[i].challenge.images = JSON.parse(e.challenge.images)
        arr[i].challenge.bookmarked = false
        arr[i].participationState = 'None'
        if(e.participants) arr[i].participants = JSON.parse(e.participants)
        if(e.invitations) arr[i].invitations = JSON.parse(e.invitations)
    })
    return array
}
function challenge_deep(array) {
    array.forEach((e, i, arr) => {
        arr[i].author = JSON.parse(e.author)
        arr[i].location = JSON.parse(e.location)
        arr[i].images = JSON.parse(e.images)
        arr[i].execution = JSON.parse(e.execution)
        if(e.execution) {
            arr[i].execution.organiser = JSON.parse(e.execution.organiser)
            if(e.execution.participants) arr[i].execution.participants = JSON.parse(e.execution.participants)
            if(e.execution.invitations) arr[i].execution.invitations = JSON.parse(e.execution.invitations)
        }
        arr[i].meeting = JSON.parse(e.meeting)
        if(e.meeting) arr[i].meeting.resources = JSON.parse(e.meeting.resources)
        arr[i].participationState = 'None'
        arr[i].bookmarked = false
    })
    return array
}
function post_full(array) {
    array.forEach((e, i, arr) => {
        arr[i].account = JSON.parse(e.account)
        arr[i].claim_images = JSON.parse(e.claim_images)
        arr[i].challenge_images = JSON.parse(e.challenge_images)
    })
    return array
}