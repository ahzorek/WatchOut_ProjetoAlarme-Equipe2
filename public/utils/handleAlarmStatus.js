async function handleAlarmStatus({ id, checked }) {
  try {
    const response = await fetch(`/alarm/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isActive: checked,
      }),
    })

    if (!response.ok) {
      throw new Error(`bad stuff: ${response.status}`)
    }
    const data = await response.json()

  } catch (err) {
    console.error('Error:', err)
  }
}
export default handleAlarmStatus