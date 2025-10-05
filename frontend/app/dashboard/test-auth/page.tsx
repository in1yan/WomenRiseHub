"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"

export default function TestAuthPage() {
  const { user } = useAuth()
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>("")

  const TOKEN_STORAGE_KEY = "womenrisehub_token"
  const TOKEN_TYPE_STORAGE_KEY = "womenrisehub_token_type"
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY)
    
    setTokenInfo({
      token: token ? `${token.substring(0, 20)}...` : "Not found",
      tokenType: tokenType || "Not found",
      fullToken: token,
    })
  }, [])

  const testAnalyticsEndpoint = async () => {
    setTestResult("Testing...")
    
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
      
      if (!token) {
        setTestResult("❌ No token found in localStorage")
        return
      }

      const response = await fetch(`${API_URL}/analytics/overview?days=30`, {
        headers: {
          Authorization: `${tokenType} ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(`✅ Success! Data: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorText = await response.text()
        setTestResult(`❌ Error ${response.status}: ${errorText}`)
      }
    } catch (error) {
      setTestResult(`❌ Exception: ${error}`)
    }
  }

  const testMeEndpoint = async () => {
    setTestResult("Testing /me endpoint...")
    
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      const tokenType = localStorage.getItem(TOKEN_TYPE_STORAGE_KEY) || "Bearer"
      
      if (!token) {
        setTestResult("❌ No token found in localStorage")
        return
      }

      const response = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `${tokenType} ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(`✅ /me Success! User: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorText = await response.text()
        setTestResult(`❌ /me Error ${response.status}: ${errorText}`)
      }
    } catch (error) {
      setTestResult(`❌ Exception: ${error}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Token Information</h2>
        <div className="space-y-2">
          <p><strong>Token (truncated):</strong> {tokenInfo?.token}</p>
          <p><strong>Token Type:</strong> {tokenInfo?.tokenType}</p>
          <p><strong>API URL:</strong> {API_URL}</p>
        </div>
        
        <details className="mt-4">
          <summary className="cursor-pointer text-blue-600">Show Full Token</summary>
          <pre className="bg-gray-100 p-4 rounded overflow-auto mt-2 text-xs">
            {tokenInfo?.fullToken || "No token"}
          </pre>
        </details>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Endpoints</h2>
        <div className="space-x-4 mb-4">
          <button
            onClick={testMeEndpoint}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test /me Endpoint
          </button>
          <button
            onClick={testAnalyticsEndpoint}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Analytics Endpoint
          </button>
        </div>
        
        {testResult && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Debug Steps</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Check if user is logged in (see Current User above)</li>
          <li>Check if token exists in localStorage</li>
          <li>Test /me endpoint (should work if auth is correct)</li>
          <li>Test analytics endpoint</li>
          <li>Check browser console for errors</li>
          <li>Check backend logs for authentication errors</li>
        </ol>
      </div>
    </div>
  )
}
