import { createContext, useCallback, useContext, useReducer } from "react";

const initialUserState = {
  user: null,
  isAuthenticated: false,
};

function userReducer(state, action) {
  switch (action.type) {
    case "LOADING":
      return {
        ...state,
      };
    case "LOGIN/SIGNUP":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case "LOGOUT":
      return initialUserState;
    default:
      return state;
  }
}

const context = createContext();
function UserContextProvider({ children }) {
  const [{ isAuthenticated, user }, dispatch] = useReducer(
    userReducer,
    initialUserState
  );

  const loginOrSignup = useCallback((userData) => {
    dispatch({
      type: "LOGIN/SIGNUP",
      payload: userData,
    });
  }, []);

  const logout = useCallback(() => {
    dispatch({
      type: "LOGOUT",
    });
  }, []);

  return (
    <context.Provider value={{ user, isAuthenticated, loginOrSignup, logout }}>
      {children}
    </context.Provider>
  );
}

function useUserContext() {
  const contextValue = useContext(context);
  if (contextValue === undefined) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return contextValue;
}

export { UserContextProvider, useUserContext };
